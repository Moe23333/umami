import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import UsersTable from 'components/pages/settings/users/UsersTable';
import { useState } from 'react';
import { Button, Icon, useToast } from 'react-basics';
import { useMutation } from '@tanstack/react-query';
import useApi from 'hooks/useApi';

export default function UsersList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const { toast, showToast } = useToast();
  const { post } = useApi();
  const { mutate, isLoading } = useMutation(data => post('/api-key', data));

  const handleSave = () => {
    mutate(
      {},
      {
        onSuccess: async () => {
          showToast({ message: 'API key saved.', variant: 'success' });
        },
      },
    );
  };

  return (
    <Page loading={loading || isLoading} error={error}>
      {toast}
      <PageHeader title="Users">
        <Button onClick={handleSave}>
          <Icon icon="plus" /> Create user
        </Button>
      </PageHeader>
      <UsersTable
        onLoading={({ isLoading, error }) => {
          setLoading(isLoading);
          setError(error);
        }}
        onAddKeyClick={handleSave}
      />
    </Page>
  );
}
