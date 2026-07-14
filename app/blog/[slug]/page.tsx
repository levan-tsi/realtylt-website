import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleToc } from "@/components/blog/ArticleToc";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareRow } from "@/components/blog/ShareRow";
import { fmtDate, getArticle, getArticles, type Article } from "@/lib/blog";
import { articleStructuredData, articleUrl } from "@/lib/blog/structured-data";
import { extractToc, readingTime } from "@/lib/blog/toc";
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

/** Word count of either body shape, for reading time. */
function bodyText(post: Article): string {
  return post.body.kind === "markdown" ? post.body.markdown : post.body.paragraphs.join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) return { title: "Post not found" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = articleUrl(post);
  const image = post.cover.startsWith("http") ? post.cover : `${SITE.url}${post.cover}`;
  return {
    title,
    description,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author],
      url,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) notFound();

  const url = articleUrl(post);
  const minutes = readingTime(bodyText(post));
  const toc = post.body.kind === "markdown" ? extractToc(post.body.markdown) : [];
  const hasToc = toc.length >= 3;

  const related = (await getArticles()).filter((a) => a.slug !== post.slug).slice(0, 3);

  return (
    <>
      {/* BlogPosting + BreadcrumbList (+ FAQPage when the body has a Q&A section). One
          <script> each so a malformed block can't take the others down. */}
      {articleStructuredData(post).map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(block) }} />
      ))}

      <ReadingProgress targetId="article-root" />

      <article id="article-root">
        {/* ── Hero */}
        <header className="relative isolate overflow-hidden bg-ink text-paper">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% -10%, rgba(40,168,224,0.13), transparent 68%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-9 md:pb-16 md:pt-11 lg:px-8">
            <div className="max-w-3xl">
              <nav
                aria-label="Breadcrumb"
                className="rise text-xs uppercase tracking-[0.14em] text-paper/55"
              >
                <Link href="/" className="inline-block py-1 transition-colors hover:text-paper">
                  Home
                </Link>
                <span aria-hidden className="px-2 text-paper/30">
                  /
                </span>
                <Link href="/blog" className="inline-block py-1 transition-colors hover:text-paper">
                  Blog
                </Link>
              </nav>

              <h1 className="rise rise-2 mt-6 text-3xl font-light leading-[1.14] tracking-[-0.01em] md:text-[46px]">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="rise rise-3 mt-5 max-w-2xl text-lg leading-relaxed text-paper/75">
                  {post.excerpt}
                </p>
              )}

              <div className="rise rise-4 mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-paper/70">
                <span className="text-paper/90">{post.author}</span>
                <span aria-hidden className="text-paper/25">
                  /
                </span>
                <time dateTime={post.date}>{fmtDate(post.date)}</time>
                <span aria-hidden className="text-paper/25">
                  /
                </span>
                <span>{minutes} min read</span>
              </div>

              <div className="rise rise-5 mt-6">
                <ShareRow url={url} title={post.title} tone="light" />
              </div>
            </div>
          </div>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
        </header>

        {/* ── Body */}
        <div className="mx-auto max-w-6xl px-4 py-11 md:py-14 lg:px-8">
          {/* Cover — wide editorial band above the reading column. */}
          <div className="rise rise-3 relative aspect-[16/9] overflow-hidden rounded-sm bg-mist">
            <Image
              src={post.cover}
              alt=""
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
          </div>

          {post.placeholder && (
            <aside
              className="mt-8 flex items-start gap-3 border-l-2 border-porchlight bg-mist px-5 py-4 text-sm text-ink-soft"
              role="note"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Draft stub</span>
              <span>The full article is being migrated from our archive and will replace this placeholder.</span>
            </aside>
          )}

          {hasToc ? (
            <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14 xl:gap-20">
              <div className="min-w-0 max-w-[44rem]">
                {post.body.kind === "markdown" && <ArticleBody markdown={post.body.markdown} />}
              </div>
              {/* One wrapper = one grid cell; ArticleToc renders its own desktop rail
                  (sticky) and mobile sheet, each responsibly hidden at the other breakpoint. */}
              <div className="lg:relative">
                <ArticleToc items={toc} />
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-[44rem]">
              {post.body.kind === "markdown" ? (
                <ArticleBody markdown={post.body.markdown} />
              ) : (
                <div className="prose-custom">
                  <section>
                    {post.body.paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className={
                          i === 0 ? "leading-[1.75] text-stone" : "mt-6 leading-[1.75] text-stone"
                        }
                      >
                        {p}
                      </p>
                    ))}
                  </section>
                </div>
              )}
            </div>
          )}

          {/* ── End cap: share + related + ask */}
          <div className="mx-auto mt-16 max-w-[44rem]">
            <div className="flex flex-col gap-4 border-t border-[#e3e6ea] pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone">
                Found this useful? Send it to someone who is buying, selling, or moving.
              </p>
              <ShareRow url={url} title={post.title} tone="dark" />
            </div>
          </div>
        </div>

        {/* ── Related */}
        {related.length > 0 && (
          <section className="bg-mist py-16 md:py-20" aria-labelledby="related-heading">
            <div className="mx-auto max-w-6xl px-4 lg:px-8">
              <h2
                id="related-heading"
                className="text-xs font-bold uppercase tracking-[0.2em] text-stone"
              >
                Keep reading
              </h2>
              <ul className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug} className="min-w-0">
                    <article className="group relative h-full">
                      <Link href={`/blog/${r.slug}`} className="absolute inset-0 z-10" aria-label={r.title} />
                      <div className="photo-zoom relative aspect-[16/10] overflow-hidden rounded-sm bg-paper">
                        <Image
                          src={r.cover}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-stone">{fmtDate(r.date)}</p>
                      <h3 className="mt-2 text-lg font-bold leading-snug text-ink-soft transition-colors group-hover:text-porchlight-deep">
                        {r.title}
                      </h3>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Ask us */}
        <section className="bg-ink py-16 text-center text-paper md:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-2xl font-light leading-snug md:text-3xl">
              Have a question this post did not answer?
            </p>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-paper/70">
              We answer seven days a week. Ask about this article, or anything else across the Hudson Valley.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/connect" variant="light">
                Ask us directly
              </Button>
              <Button href="/blog" variant="outline-light">
                More articles
              </Button>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
