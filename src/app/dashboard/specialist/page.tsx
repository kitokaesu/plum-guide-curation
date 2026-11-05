import Link from "next/link";
import { InspectionAuditForm } from "@/components/inspection-audit-form";
import { SlotPublisher } from "@/components/slot-publisher";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { WithdrawSlotButton } from "@/components/withdraw-slot-button";
import { requireRole } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SpecialistDashboardPage() {
  const session = await requireRole("SPECIALIST");

  const slots = await prisma.inspectionSlot.findMany({
    where: { specialistId: session.id },
    include: {
      property: {
        include: {
          host: { select: { fullName: true, email: true } },
        },
      },
    },
    orderBy: { slotDatetime: "asc" },
  });

  const openSlots = slots.filter((slot) => slot.status === "AVAILABLE");
  const bookedSlots = slots.filter((slot) => slot.status === "BOOKED");
  const completed = slots
    .filter((slot) => slot.status === "COMPLETED")
    .sort((a, b) => b.slotDatetime.getTime() - a.slotDatetime.getTime());

  const scored = completed.filter((slot) => slot.score !== null);
  const averageScore = scored.length
    ? Math.round(
        (scored.reduce((total, slot) => total + (slot.score ?? 0), 0) /
          scored.length) *
          10
      ) / 10
    : null;

  return (
    <div className="space-y-10">
      <section aria-label="Inspection summary">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Upcoming inspections"
            value={bookedSlots.length}
            detail="Booked by hosts"
            accent
          />
          <StatCard
            label="Open slots"
            value={openSlots.length}
            detail="Waiting to be claimed"
          />
          <StatCard
            label="Completed"
            value={completed.length}
            detail="All-time inspections"
          />
          <StatCard
            label="Average score"
            value={averageScore ?? "—"}
            detail="Across completed Plum Tests"
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <SlotPublisher />

          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Open slots</p>
            <h2 className="mt-2 text-xl">Published availability</h2>
            {openSlots.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                You have no open slots. Publish one above so hosts can book their
                Plum Test.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-hairline">
                {openSlots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm">
                        {formatDateTime(slot.slotDatetime)}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
                        90 minutes · unclaimed
                      </p>
                    </div>
                    <WithdrawSlotButton slotId={slot.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <p className="eyebrow">Diary</p>
          <h2 className="mt-1 text-2xl">Upcoming home inspections</h2>

          {bookedSlots.length === 0 ? (
            <div className="card mt-4 p-6 text-sm leading-relaxed text-muted">
              No inspections booked yet. Hosts book directly from your published
              slots — you&apos;ll see the property, address and host contact here.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {bookedSlots.map((slot) => (
                <article key={slot.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                        {formatDateTime(slot.slotDatetime)}
                      </p>
                      <h3 className="mt-2 font-display text-xl">
                        {slot.property?.title ?? "Property removed"}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {slot.property?.location}
                      </p>
                      {slot.property ? (
                        <p className="mt-1 text-xs text-muted">
                          Host: {slot.property.host.fullName} ·{" "}
                          {slot.property.host.email}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge status="BOOKED" />
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    Plum Test · 150 checks · 90 minutes. Bring the audit
                    checklist; results are recorded below.
                  </p>

                  <details className="mt-4 border-t border-hairline pt-3">
                    <summary className="cursor-pointer text-sm font-medium marker:text-gold">
                      Open audit form
                    </summary>
                    <div className="mt-4">
                      <InspectionAuditForm
                        slotId={slot.id}
                        propertyTitle={slot.property?.title ?? "this home"}
                      />
                    </div>
                  </details>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="completed-heading">
        <div>
          <p className="eyebrow">Archive</p>
          <h2 id="completed-heading" className="mt-1 text-2xl">
            Completed inspections
          </h2>
        </div>

        {completed.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">
            Your completed Plum Tests and their scores will be listed here.
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="table-base min-w-[720px]">
              <thead>
                <tr>
                  <th>Home</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Notes</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((slot) => (
                  <tr key={slot.id}>
                    <td>
                      <p className="font-medium">
                        {slot.property?.title ?? "Property removed"}
                      </p>
                      <p className="text-xs text-muted">
                        {slot.property?.location}
                      </p>
                    </td>
                    <td className="text-sm">
                      {formatDate(
                        slot.completedAt ?? slot.slotDatetime
                      )}
                    </td>
                    <td className="text-sm font-medium">
                      {slot.score ?? "—"}
                    </td>
                    <td className="max-w-xs text-xs leading-relaxed text-muted">
                      {slot.reportNotes ?? "No notes recorded."}
                    </td>
                    <td>
                      {(slot.score ?? 0) >= 85 ? (
                        <span className="badge badge-green">Passed</span>
                      ) : (
                        <span className="badge badge-red">Referred</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-hairline bg-goldSoft/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Your standard</p>
            <p className="mt-2 max-w-xl font-display text-2xl">
              Score honestly. A home that fails today is a home that can be
              better tomorrow.
            </p>
          </div>
          <Link href="/properties" className="btn btn-outline btn-sm">
            See the collection
          </Link>
        </div>
      </section>
    </div>
  );
}
