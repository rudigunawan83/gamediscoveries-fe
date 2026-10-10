import { getTranslations } from "next-intl/server";
import { UserProfileView } from "@/features/community/components/UserProfileView";
import { createMetadata } from "@/lib/seo/metadata";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const t = await getTranslations("Profile");
  return createMetadata({
    title: `@${username}`,
    description: t("publicMetaDescription", { username }),
    path: `/profile/${username}`,
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  return <UserProfileView username={username} />;
}
