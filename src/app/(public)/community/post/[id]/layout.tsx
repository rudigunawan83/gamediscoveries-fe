import { cache, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCommunityPost } from "@/lib/api/community";
import { ApiClientError } from "@/lib/api/types";
import { shouldIndexCommunityPost } from "@/lib/seo/indexability";
import { createMetadata } from "@/lib/seo/metadata";

interface CommunityPostLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

const loadPost = cache(async (id: string) => {
  try {
    return (await getCommunityPost(id)).data ?? null;
  } catch (error) {
    if (error instanceof ApiClientError && [400, 404, 422].includes(error.status)) {
      return null;
    }
    throw error;
  }
});

export async function generateMetadata({ params }: CommunityPostLayoutProps) {
  const { id } = await params;
  const post = await loadPost(id);
  const path = `/community/post/${id}`;
  if (!post) {
    const t = await getTranslations("Community");
    return createMetadata({ title: t("postNotFound"), path, noIndex: true });
  }

  const decision = shouldIndexCommunityPost({
    contentLength: post.content.trim().length,
    publicVisibility: true,
    moderationStatus: post.status === "published" ? "visible" : post.status,
    engagement: post.reactionCount + post.commentCount,
  });
  return createMetadata({
    title: post.title,
    description: post.content.replace(/\s+/g, " ").trim().slice(0, 160),
    path,
    type: "article",
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export default async function CommunityPostLayout({
  children,
  params,
}: CommunityPostLayoutProps) {
  const { id } = await params;
  if (!(await loadPost(id))) notFound();
  return children;
}
