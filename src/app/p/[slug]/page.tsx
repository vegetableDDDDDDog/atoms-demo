import { getPublishedVersion } from "@/features/publish/publishService";
import { notFound } from "next/navigation";

export default async function PublishedPage({ params }: { params: { slug: string } }) {
  const publish = await getPublishedVersion(params.slug);

  if (!publish || !publish.isActive) {
    notFound();
  }

  const version = publish.version;
  const document = `<!doctype html><html><head><style>${version.css}</style></head><body>${version.html}<script>${version.js}</script></body></html>`;

  return (
    <main style={{ minHeight: "100vh", background: "#eef2f7", padding: 16 }}>
      <iframe
        title={version.title}
        sandbox="allow-scripts"
        srcDoc={document}
        style={{
          width: "100%",
          height: "calc(100vh - 32px)",
          border: "1px solid #dce3ee",
          borderRadius: 12,
          background: "#fff"
        }}
      />
    </main>
  );
}
