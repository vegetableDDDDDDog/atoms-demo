import type { BuildRoomCopy } from "@/features/i18n/dictionary";

export function DeployPanel({
  canPublish,
  publishUrl,
  onPublish,
  copy
}: {
  canPublish: boolean;
  publishUrl: string | null;
  onPublish: () => void;
  copy: BuildRoomCopy;
}) {
  return (
    <section className="deploy-panel">
      <div>
        <p className="section-title">{copy.deployTitle}</p>
        <h3>{publishUrl ? copy.deployReady : copy.topbarPublishIdle}</h3>
        <p>{publishUrl ? `${copy.publishedAt} ${publishUrl}` : copy.deployEmpty}</p>
      </div>
      <button className="button-primary" onClick={onPublish} disabled={!canPublish}>
        {copy.publish}
      </button>
    </section>
  );
}
