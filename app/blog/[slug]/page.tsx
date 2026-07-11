import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fmtDate, getPost, POSTS } from "@/content/blog/posts";
import { SITE } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonld";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    image: `${SITE.url}${post.cover}`,
    author: { "@type": "Person", name: "Levan Tsiklauri" },
    publisher: { "@type": "Organization", name: SITE.legalName },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    description: post.excerpt,
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
          <p className="mt-4 text-paper/75">{post.excerpt}</p>
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

        <div className="prose-custom mt-8 space-y-5 leading-relaxed text-stone">
          {post.body.map((p, i) => (
            <p key={i} className={i === 0 && post.placeholder ? "text-sm italic text-stone" : ""}>
              {p}
            </p>
          ))}
        </div>

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
