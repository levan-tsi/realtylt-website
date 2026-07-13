import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fmtDate, getArticle, getArticles } from "@/lib/blog";
import { renderMarkdown } from "@/lib/blog/markdown";
import { SITE } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonld";

// Literal by necessity — Next statically analyses this export and rejects an imported
// constant. Keep in sync with BLOG_REVALIDATE_SECONDS in lib/blog/db.ts (300).
export const revalidate = 300;

// Pre-render every article known at build time (static stubs + everything already
// published from the CRM). dynamicParams stays TRUE so a post published AFTER this build
// still resolves on first request — an unknown or unpublished slug falls through to
// notFound() below, so drafts 404 exactly like a typo does.
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) return { title: "Post not found" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      url: `${SITE.url}/blog/${post.slug}`,
      images: [{ url: post.cover.startsWith("http") ? post.cover : `${SITE.url}${post.cover}` }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    image: post.cover.startsWith("http") ? post.cover : `${SITE.url}${post.cover}`,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE.legalName },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    description: post.seoDescription || post.excerpt,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <header className="bg-ink py-14 text-paper md:py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-0">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-paper/60">
            <Link href="/blog" className="hover:text-paper">Blog</Link> /{" "}
            {fmtDate(post.date)}
          </nav>
          <h1 className="mt-4 text-3xl font-bold leading-[1.15] md:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-4 text-paper/75">{post.excerpt}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-0">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image src={post.cover} alt="" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>

        {post.placeholder && (
          <aside className="mt-8 border border-[#cccccc] bg-mist px-5 py-4 text-sm text-ink-soft" role="note">
            <strong className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone">
              Draft stub
            </strong>{" "}
            — the full article is being migrated from our archive and will replace this placeholder.
          </aside>
        )}

        {post.body.kind === "markdown" ? (
          // Markdown blocks carry their own vertical rhythm (headings/lists/quotes need
          // more room than a paragraph) — no space-y here, it would flatten them all to
          // one gap. First block sits flush against the cover.
          <div className="prose-custom mt-8 leading-relaxed text-stone [&>*:first-child]:mt-0">
            {renderMarkdown(post.body.markdown)}
          </div>
        ) : (
          <div className="prose-custom mt-8 space-y-5 leading-relaxed text-stone">
            {post.body.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 && post.placeholder ? "text-sm italic text-stone" : ""}>
                {p}
              </p>
            ))}
          </div>
        )}

        <div className="mt-12 bg-mist p-7 text-center">
          <p className="text-xl font-light text-ink">Have a question this post didn&rsquo;t answer?</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button href="/connect">Ask us directly</Button>
            <Button href="/blog" variant="outline">More articles</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
