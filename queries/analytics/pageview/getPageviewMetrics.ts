import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';
import { Prisma } from '@prisma/client';
import { EVENT_TYPE } from 'lib/constants';

export async function getPageviewMetrics(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      column: Prisma.WebsiteEventScalarFieldEnum | Prisma.SessionScalarFieldEnum;
      filters: object;
      type: string;
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
    column: Prisma.WebsiteEventScalarFieldEnum | Prisma.SessionScalarFieldEnum;
    filters: object;
    type: string;
  },
) {
  const { startDate, endDate, column, filters = {}, type } = data;
  const { rawQuery, parseFilters, toUuid } = prisma;
  const params: any = [
    websiteId,
    startDate,
    endDate,
    type === 'event' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  ];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = $1${toUuid()}
      and website_event.created_at between $2 and $3
      and event_type = $4
      ${filterQuery}
    group by 1
    order by 2 desc`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    column: Prisma.WebsiteEventScalarFieldEnum | Prisma.SessionScalarFieldEnum;
    filters: object;
    type: string;
  },
) {
  const { startDate, endDate, column, filters = {}, type } = data;
  const { rawQuery, parseFilters, getBetweenDates } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = {
    websiteId,
    revId: website?.revId || 0,
    eventType: type === 'event' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  };
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from event
    where website_id = {websiteId:UUID}
      and rev_id = {revId:UInt32}
      and event_type = {eventType:UInt32}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${filterQuery}
    group by x
    order by y desc`,
    params,
  );
}
