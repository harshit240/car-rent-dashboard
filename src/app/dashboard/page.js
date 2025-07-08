import { redirect } from 'next/navigation';
import Dashboard from '@/app/components/Dashboard';
import Notifications from '@/app/components/Notifications';
import { getListings } from '@/app/lib/database';
import { verifyToken } from '@/app/lib/auth';
import { cookies } from 'next/headers';

async function getServerSideProps() {
  try {
    const data = getListings(1, 10, 'all');
    return data;
  } catch (error) {
    return {
      listings: [],
      page: 1,
      totalPages: 1,
      total: 0
    };
  }
}

export default async function DashboardPage() {
  const initialData = await getServerSideProps();

  return (
    <>
      <Dashboard initialData={initialData} />
      <Notifications />
    </>
  );
}