import { UserProfileView } from "@/features/community/components/UserProfileView";
import { createMetadata } from "@/lib/seo/metadata";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  return createMetadata({
    title: `@${username}`,
    description: `Player profile for ${username} on GameDiscoveries.`,
    path: `/profile/${username}`,
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return <UserProfileView username={username} />;
}
