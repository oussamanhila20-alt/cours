import { Link } from "@/i18n/navigation";
import {
  assignStudentToGroupAction,
  createGroupAction,
  deleteGroupAction,
} from "@/actions/groups";
import { ScheduleRowDelete } from "@/components/schedule-row-delete";
import { GROUP_SCHEDULE_MAX_SLOTS } from "@/lib/group-schedule";
import { ANNEES_SCOLAIRES } from "@/lib/school-years";
import { prisma } from "@/lib/prisma";

const jours = [
  { v: 1, l: "Lundi" },
  { v: 2, l: "Mardi" },
  { v: 3, l: "Mercredi" },
  { v: 4, l: "Jeudi" },
  { v: 5, l: "Vendredi" },
  { v: 6, l: "Samedi" },
  { v: 0, l: "Dimanche" },
];

type PageProps = {
  searchParams: Promise<{ scheduleLimit?: string }>;
};

export default async function AdminGroupesPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const [groupsRaw, students, profs] = await Promise.all([
    prisma.group.findMany({
      orderBy: [
        { anneeScolaire: "desc" },
        { name: "asc" },
        { matiere: "asc" },
      ],
      include: {
        students: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true },
        },
        scheduleEntries: {
          orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
          include: { professeur: { select: { name: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "ELEVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        groupId: true,
        groupe: true,
        anneeScolaire: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "PROFESSEUR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const titulaireIds = [
    ...new Set(
      groupsRaw.map((g) => g.titulaireId).filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];
  const titulaires =
    titulaireIds.length === 0
      ? []
      : await prisma.user.findMany({
          where: { id: { in: titulaireIds } },
          select: { id: true, name: true },
        });
  const titulaireById = new Map(titulaires.map((u) => [u.id, u]));
  const groups = groupsRaw.map((g) => ({
    ...g,
    titulaire: g.titulaireId ? (titulaireById.get(g.titulaireId) ?? null) : null,
  }));

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/admin" className="text-navy hover:underline dark:text-gold">
          ← Tableau de bord
        </Link>
      </p>

      {sp.scheduleLimit ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        >
          Ce groupe a déjà {GROUP_SCHEDULE_MAX_SLOTS} créneaux (maximum autorisé). Supprimez un
          créneau dans <strong>Emploi du temps</strong> pour en ajouter un autre.
        </p>
      ) : null}

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-lg font-semibold">Créer un groupe (classe)</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Indiquez le <strong>nom du groupe</strong> et le <strong>professeur titulaire</strong>. Les
          matières, horaires et salles se gèrent ensuite dans{" "}
          <Link
            href="/admin/emploi-du-temps"
            className="font-medium text-navy underline-offset-2 hover:underline dark:text-gold"
          >
            Emploi du temps
          </Link>{" "}
          en rattachant chaque créneau à ce groupe.
        </p>
        <form action={createGroupAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs">
            Nom du groupe / classe
            <input
              name="name"
              required
              placeholder="ex. 4ème A"
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Professeur titulaire
            <select
              name="titulaireId"
              required
              className="min-w-[12rem] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            >
              <option value="">— Choisir —</option>
              {profs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Année scolaire
            <select
              name="anneeScolaire"
              required
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
              defaultValue={ANNEES_SCOLAIRES[1]}
            >
              {ANNEES_SCOLAIRES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90"
          >
            Créer le groupe
          </button>
        </form>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Groupes</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Ajoutez les élèves à chaque groupe ci-dessous. Créneaux : jusqu’à{" "}
              {GROUP_SCHEDULE_MAX_SLOTS} par groupe via{" "}
              <Link
                href="/admin/emploi-du-temps"
                className="font-medium text-navy underline-offset-2 hover:underline dark:text-gold"
              >
                Emploi du temps
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {groups.map((g) => {
            const slots = g.scheduleEntries.length;
            const studentsNotInGroup = students.filter((s) => s.groupId !== g.id);
            const groupLabel = g.matiere
              ? `${g.name} · ${g.matiere} · ${g.anneeScolaire}`
              : `${g.name} · ${g.anneeScolaire}`;
            return (
              <div
                key={g.id}
                className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <p className="text-sm font-semibold text-navy dark:text-gold">{g.name}</p>
                <p className="text-xs text-zinc-500">
                  {g.anneeScolaire}
                  {g.titulaire ? (
                    <>
                      {" "}
                      · Titulaire : <span className="font-medium">{g.titulaire.name}</span>
                    </>
                  ) : null}
                  {g.matiere ? <> · {g.matiere}</> : null}
                </p>

                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Élèves du groupe ({g.students.length})
                  </p>
                  {g.students.length === 0 ? (
                    <p className="mt-2 text-xs italic text-zinc-500">Aucun élève pour l’instant.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                      {g.students.map((st) => (
                        <li
                          key={st.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 px-2 py-1.5 dark:bg-zinc-900/50"
                        >
                          <span>
                            <span className="font-medium">{st.name}</span>
                            <span className="text-zinc-500"> · {st.email}</span>
                          </span>
                          <form action={assignStudentToGroupAction} className="shrink-0">
                            <input type="hidden" name="studentId" value={st.id} />
                            <input type="hidden" name="groupId" value="" />
                            <button
                              type="submit"
                              className="text-[11px] text-red-600 hover:underline dark:text-red-400"
                            >
                              Retirer
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                  {studentsNotInGroup.length > 0 ? (
                    <form
                      action={assignStudentToGroupAction}
                      className="mt-3 flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800"
                    >
                      <input type="hidden" name="groupId" value={g.id} />
                      <label className="flex min-w-0 flex-1 flex-col gap-0.5 text-xs">
                        Ajouter un élève
                        <select
                          name="studentId"
                          required
                          className="max-w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Choisir un élève…
                          </option>
                          {studentsNotInGroup.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.email})
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="submit"
                        className="rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy/90"
                      >
                        Ajouter
                      </button>
                    </form>
                  ) : (
                    <p className="mt-2 text-[11px] text-zinc-500">
                      Tous les élèves sont déjà affectés à un groupe (ou aucun compte élève).
                    </p>
                  )}
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Emploi du temps ({slots} / {GROUP_SCHEDULE_MAX_SLOTS} créneaux)
                    </p>
                    <Link
                      href="/admin/emploi-du-temps"
                      className="text-xs font-medium text-brandblue underline-offset-2 hover:underline"
                    >
                      Gérer les créneaux →
                    </Link>
                  </div>
                  {slots > 0 ? (
                    <ul className="mt-2 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                      {g.scheduleEntries.map((e) => (
                        <li
                          key={e.id}
                          className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-100 px-2 py-1.5 dark:border-zinc-800"
                        >
                          <span>
                            <strong>{e.title}</strong> —{" "}
                            {jours.find((d) => d.v === e.weekday)?.l ?? e.weekday}{" "}
                            {e.startTime}–{e.endTime}
                            {e.professeur?.name ? ` · ${e.professeur.name}` : ""}
                            {e.matiere ? ` · ${e.matiere}` : ""}
                            {e.room ? ` · salle ${e.room}` : ""}
                          </span>
                          <ScheduleRowDelete id={e.id} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs italic text-zinc-500">
                      Aucun créneau — ajoutez-en dans Emploi du temps (sélectionnez «{" "}
                      {groupLabel} » dans le référentiel groupe).
                    </p>
                  )}
                </div>

                <form
                  action={deleteGroupAction.bind(null, g.id)}
                  className="mt-4 border-t border-zinc-100 pt-2 dark:border-zinc-800"
                >
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Supprimer ce groupe
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Vue globale — affectation des élèves</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pour modifier rapidement le groupe d’un élève sans passer par la fiche ci-dessus.
        </p>
        <div className="mt-3 data-table-wrap">
          <table className="data-table">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
              <tr>
                <th className="p-3">Élève</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Classe (texte)</th>
                <th className="p-3">Année</th>
                <th className="p-3">Groupe (référentiel)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-zinc-600 dark:text-zinc-300">{s.email}</td>
                  <td className="p-3">{s.groupe ?? "—"}</td>
                  <td className="p-3">{s.anneeScolaire ?? "—"}</td>
                  <td className="p-3">
                    <form
                      action={assignStudentToGroupAction}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="studentId" value={s.id} />
                      <select
                        name="groupId"
                        defaultValue={s.groupId ?? ""}
                        className="max-w-[18rem] rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                      >
                        <option value="">— Aucun —</option>
                        {groups.map((gr) => (
                          <option key={gr.id} value={gr.id}>
                            {gr.name} · {gr.anneeScolaire}
                            {gr.matiere ? ` · ${gr.matiere}` : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy/90"
                      >
                        Enregistrer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
