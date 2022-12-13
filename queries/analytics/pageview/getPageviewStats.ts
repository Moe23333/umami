import cache from 'lib/cache';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { EVENT_TYPE } from 'lib/constants';

export async function getPageviewStats(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      timezone?: string;
      unit?: string;
      count?: string;
      filters: object;
      sessionKey?: string;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    unit?: string;
    count?: string;
    filters: object;
    sessionKey?: string;
  },
) {
  const {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    count = '*',
    filters = {},
    sessionKey = 'session_id',
  } = data;
  const { getDateQuery, parseFilters, rawQuery } = prisma;
  const params = [startDate, endDate];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${getDateQuery('website_event.created_at', unit, timezone)} t,
        count(${count !== '*' ? `${count}${sessionKey}` : count}) y
      from website_event
        ${joinSession}
      where website.website_id='${websiteId}'
        and pageview.created_at between $1 and $2
        and event_type = ${EVENT_TYPE.pageView}
        ${filterQuery}
      group by 1`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    unit?: string;
    count?: string;
    filters: object;
    sessionKey?: string;
  },
) {
  const { startDate, endDate, timezone = 'UTC', unit = 'day', count = '*', filters = {} } = data;
  const { parseFilters, rawQuery, getDateStringQuery, getDateQuery, getBetweenDates } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = [websiteId, website?.revId || 0];
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select
      ${getDateStringQuery('g.t', unit)} as t, 
      g.y as y
    from
      (select 
        ${getDateQuery('created_at', unit, timezone)} t,
        count(${count !== '*' ? 'distinct session_id' : count}) y
      from event
      where website_id = $1      
        and rev_id = $2  
        and event_type = ${EVENT_TYPE.pageView}
        and ${getBetweenDates('created_at', startDate, endDate)}
        ${filterQuery}
      group by t) g
    order by t`,
    params,
  );
}