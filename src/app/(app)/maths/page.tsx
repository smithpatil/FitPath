import ColourGraph from "@/components/maths/ColourGraph";
import Concept, { Chip, Formula } from "@/components/maths/Concept";
import HasseDiagram from "@/components/maths/HasseDiagram";
import KnapsackTable from "@/components/maths/KnapsackTable";
import TruthTable from "@/components/maths/TruthTable";
import { EQUIPMENT_LABEL, GROUP_LABEL } from "@/lib/labels";
import { SAFETY_RULES } from "@/lib/math/logic";
import { buildMathsExamples } from "@/lib/mathsExamples";
import { EXERCISES } from "@/data/exercises";
import { getCurrentWeek, getLoggedResults } from "@/lib/planStore";
import { WEIGHT_STEP, suggestNextWeight } from "@/lib/strength";
import { fromKg } from "@/lib/units";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "The Maths Behind It — FitPath" };

const eq = (id: string) => EQUIPMENT_LABEL[id] ?? id;
const grp = (id: string) => GROUP_LABEL[id] ?? id;
const set = (items: string[]) => (items.length ? `{ ${items.join(", ")} }` : "{ } (empty set)");
const big = (n: bigint) => n.toLocaleString("en-GB");

const TOC = [
  ["sets", "Set theory"],
  ["logic", "Propositional logic"],
  ["relations", "Relations and partial orders"],
  ["graph", "Graph colouring"],
  ["counting", "Combinatorics and pigeonhole"],
  ["recurrence", "Recurrence and induction"],
  ["knapsack", "Dynamic programming (knapsack)"],
];

export default async function MathsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = (await getProfile(supabase))!;
  const week = await getCurrentWeek(supabase, user!.id, profile);
  // Latest result with a weight and a target, for the double-progression example.
  const lastLift = (await getLoggedResults(supabase)).find((r) => r.weightKg !== null && r.target !== null);
  const liftName = lastLift ? EXERCISES.find((e) => e.id === lastLift.exerciseId)?.name : undefined;
  const ex = buildMathsExamples(
    profile,
    week.days.map((d) => ({ exerciseIds: d.items.map((i) => i.exercise.id) })),
    week.weekIndex,
    week.multipliers,
  );
  const { sets, logic, relations, graph, counting, recurrence, knapsack: knap } = ex;

  // Colour classes for the graph section: colour number → muscle groups
  const classes = new Map<number, string[]>();
  for (const v of graph.graph.vertices) classes.set(graph.colouring[v], [...(classes.get(graph.colouring[v]) ?? []), v]);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-bold">The Maths Behind It</h1>
        <p className="mt-4 text-xl text-muted">
          Your plan is not guesswork and it is not written by AI. It is built by seven ideas from discrete mathematics.
          Below, each idea is explained in simple words and then shown working on <strong className="text-ink">your own answers</strong>.
        </p>
        <nav aria-label="Concepts on this page" className="mt-6 rounded-2xl bg-accent-soft p-5">
          <p className="font-semibold text-accent-dark">Jump to</p>
          <ol className="mt-2 grid gap-1 sm:grid-cols-2">
            {TOC.map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="font-medium text-accent underline">
                  {i + 1}. {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {/* ---------------- 1. SETS ---------------- */}
      <Concept
        id="sets"
        number={1}
        title="Set theory"
        where="Working out which exercises you are able to do."
        simple={
          <>
            <p>
              A <strong>set</strong> is a collection of different things, like { "{" }dumbbells, resistance band{ "}" }. Three simple moves
              are enough for us:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>Intersection (A ∩ B)</strong>: the things that are in <em>both</em> sets.</li>
              <li><strong>Union (A ∪ B)</strong>: everything that is in either set.</li>
              <li><strong>Difference (A − B)</strong>: what is left in A after you take away anything that is in B.</li>
            </ul>
          </>
        }
        formula={
          <>
            <Formula>
              U = the equipment you can use<br />
              R = the equipment an exercise needs<br />
              doable ⟺ U ∩ R = R<br />
              usable = doable − excluded
            </Formula>
            <p className="text-muted">
              In words: an exercise is doable when everything it needs is something you have. Then we remove the exercises your safety
              answers rule out (next section).
            </p>
          </>
        }
      >
        <p>
          <strong>U (your equipment):</strong> {set(sets.universe.map(eq))}
        </p>
        <p className="text-base text-muted">Body weight is always included, and a gym includes all the other equipment.</p>
        <ul className="space-y-2">
          {sets.samples.map((s) => (
            <li key={s.name} className="rounded-xl bg-white p-4">
              <strong>{s.name}</strong> needs R = {set(s.required.map(eq))}
              <br />
              U ∩ R = {set(s.intersection.map(eq))}
              <br />
              U ∩ R {s.doable ? "=" : "≠"} R, so it is{" "}
              <strong className={s.doable ? "text-accent" : "text-red-800"}>{s.doable ? "doable ✓" : "not doable ✗"}</strong>
            </li>
          ))}
        </ul>
        <p>
          Out of <strong>{sets.total}</strong> exercises, <strong>{sets.doableCount}</strong> are doable for you. The safety rules remove{" "}
          <strong>{sets.excludedInDoable.length}</strong> of those, so{" "}
          <strong>
            {sets.doableCount} − {sets.excludedInDoable.length} = {sets.usableCount}
          </strong>{" "}
          exercises are usable.
        </p>
        {sets.excludedInDoable.length > 0 && (
          <p className="flex flex-wrap items-center gap-2">
            <span>Removed for you:</span>
            {sets.excludedInDoable.slice(0, 12).map((n) => (
              <Chip key={n} tone="muted">{n}</Chip>
            ))}
            {sets.excludedInDoable.length > 12 && <span className="text-muted">and {sets.excludedInDoable.length - 12} more</span>}
          </p>
        )}
      </Concept>

      {/* ---------------- 2. LOGIC ---------------- */}
      <Concept
        id="logic"
        number={2}
        title="Propositional logic"
        where="The safety rules that keep unsuitable exercises out of your plan."
        simple={
          <>
            <p>
              A <strong>proposition</strong> is a statement that is either true or false, such as &quot;you have a knee problem&quot;.
              Statements can be joined:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>∧ (and)</strong>: true only when both parts are true.</li>
              <li><strong>→ (implies)</strong>: &quot;if P then Q&quot;. It is broken only when P is true and Q is false.</li>
            </ul>
            <p>Each safety rule is an &quot;if … then exclude&quot; sentence, so FitPath can check it the same way every time.</p>
          </>
        }
        formula={
          <>
            <Formula>{logic.rule.id}: ({logic.rule.premises.join(" ∧ ")}) → exclude</Formula>
            <p className="text-muted">{logic.rule.why} Here is its truth table (every possible case):</p>
            <TruthTable rule={logic.rule} rows={logic.table} />
            <p className="text-muted">
              The red row is the only one where the rule is broken: the conditions are true, but the exercise is <em>not</em> excluded. FitPath
              never allows that row.
            </p>
          </>
        }
      >
        <p className="font-semibold">All the safety rules:</p>
        <ul className="space-y-2">
          {SAFETY_RULES.map((r) => (
            <li key={r.id} className="rounded-xl bg-white p-3">
              <span className="font-mono">
                {r.id}: ({r.premises.join(" ∧ ")}) → exclude
              </span>
              <br />
              <span className="text-base text-muted">{r.why}</span>
            </li>
          ))}
        </ul>
        {logic.excludedForYou.length === 0 ? (
          <p>With your answers, no rule fires for any exercise you could do, so nothing is removed.</p>
        ) : (
          <>
            <p>
              With your answers, the rules fire for <strong>{logic.excludedTotal}</strong> exercises you could otherwise do:
            </p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {logic.excludedForYou.slice(0, 10).map((x) => (
                <li key={x.name} className="rounded-xl bg-white px-3 py-2 text-base">
                  {x.name} <span className="font-mono text-muted">({x.rules.join(", ")})</span>
                </li>
              ))}
            </ul>
            {logic.excludedForYou.length > 10 && <p className="text-muted">…and {logic.excludedForYou.length - 10} more.</p>}
          </>
        )}
      </Concept>

      {/* ---------------- 3. RELATIONS ---------------- */}
      <Concept
        id="relations"
        number={3}
        title="Relations and partial orders"
        where="Progression from easier to harder exercises, and the Swap exercise button."
        simple={
          <>
            <p>
              A <strong>relation</strong> is a rule that says which pairs of things are connected. We use two kinds.
            </p>
            <p>
              <strong>Partial order (progression).</strong> &quot;a ≤ b&quot; means a is easier than, or the same as, b. Push-ups build on knee
              push-ups, which build on wall push-ups. It is <em>partial</em> because some exercises can&apos;t be compared at all (a squat
              and a push-up).
            </p>
            <p>
              <strong>Equivalence relation (swapping).</strong> &quot;a ~ b&quot; means same muscle group and same equipment. Such a rule cuts
              all the exercises into separate groups called <em>classes</em>, and any exercise can be swapped for another in its class.
            </p>
          </>
        }
        formula={
          <>
            <Formula>
              Partial order ≤ must be:<br />
              reflexive: a ≤ a<br />
              antisymmetric: a ≤ b and b ≤ a ⟹ a = b<br />
              transitive: a ≤ b and b ≤ c ⟹ a ≤ c
            </Formula>
            <Formula>
              Equivalence ~ must be:<br />
              reflexive: a ~ a<br />
              symmetric: a ~ b ⟹ b ~ a<br />
              transitive: a ~ b and b ~ c ⟹ a ~ c
            </Formula>
            <p className="text-muted">
              A <strong>Hasse diagram</strong> draws only the direct steps: if a &lt; b &lt; c, it draws a–b and b–c, but not a–c, because
              that follows from the others.
            </p>
          </>
        }
      >
        {relations.group && relations.nodes.length > 0 ? (
          <>
            <p>
              <strong>Hasse diagram of your {grp(relations.group).toLowerCase()} exercises</strong> (only ones usable for you):
            </p>
            <div className="rounded-xl bg-white p-3">
              <HasseDiagram nodes={relations.nodes} edges={relations.edges} />
            </div>
            {relations.properties && (
              <p className="text-base">
                Checked by the program on these exercises: reflexive {relations.properties.reflexive ? "✓" : "✗"}, antisymmetric{" "}
                {relations.properties.antisymmetric ? "✓" : "✗"}, transitive {relations.properties.transitive ? "✓" : "✗"}. So it really is a
                partial order.
              </p>
            )}
            {relations.incomparable && (
              <p className="text-base">
                Not comparable: <strong>{relations.incomparable[0]}</strong> and <strong>{relations.incomparable[1]}</strong> (neither is
                built on the other).
              </p>
            )}
          </>
        ) : (
          <p>Your equipment and safety answers leave no exercises that build on each other, so there is no diagram to draw yet.</p>
        )}
        {relations.equivalence && (
          <div className="rounded-xl bg-white p-4">
            <p>
              <strong>Swap example.</strong> The class of <strong>{relations.equivalence.exercise}</strong> (same muscle group and equipment) is
              {" "}
              {set(relations.equivalence.members)}.
            </p>
            <p className="mt-2">
              {relations.equivalence.swaps.length > 0
                ? `The Swap button can replace it with: ${relations.equivalence.swaps.join(", ")}.`
                : "There is nothing else in its class that suits you, so Swap will tell you to keep it."}
            </p>
            <p className="mt-2 text-base text-muted">
              Your usable exercises fall into {relations.equivalence.classCount} classes. Checked: reflexive{" "}
              {relations.equivalence.properties.reflexive ? "✓" : "✗"}, symmetric {relations.equivalence.properties.symmetric ? "✓" : "✗"},
              transitive {relations.equivalence.properties.transitive ? "✓" : "✗"}.
            </p>
          </div>
        )}
      </Concept>

      {/* ---------------- 4. GRAPH COLOURING ---------------- */}
      <Concept
        id="graph"
        number={4}
        title="Graph colouring"
        where="Deciding which muscle groups go on which training day."
        simple={
          <>
            <p>
              A <strong>graph</strong> is dots (vertices) joined by lines (edges). Here each dot is a muscle group, and a line means &quot;these
              two share muscles, so give them a rest from each other&quot; (for example chest and shoulders).
            </p>
            <p>
              A <strong>proper colouring</strong> gives every dot a colour so that dots joined by a line never share a colour. Same colour =
              safe to train on the same day. The fewest colours needed is called the <strong>chromatic number χ</strong>.
            </p>
          </>
        }
        formula={
          <>
            <Formula>
              Proper colouring: for every edge {"{"}u, v{"}"} we need colour(u) ≠ colour(v)<br />
              χ(G) = the smallest number of colours that works
            </Formula>
            <p className="text-muted">
              Chest, shoulders and arms all conflict with each other (a triangle), so they need 3 different colours, which is why χ is at
              least 3 for a full plan.
            </p>
          </>
        }
      >
        <div className="rounded-xl bg-white p-3">
          <ColourGraph graph={graph.graph} colouring={graph.colouring} />
        </div>
        <p>
          Your graph has <strong>{graph.graph.vertices.length}</strong> muscle groups and <strong>{graph.graph.edges.length}</strong> conflict lines.
          The program found that <strong>χ = {graph.chromaticNumber}</strong> colours are needed, and checked the colouring is proper{" "}
          {graph.proper ? "✓" : "✗"}.
        </p>
        <ul className="space-y-1">
          {[...classes.entries()].sort((a, b) => a[0] - b[0]).map(([c, gs]) => (
            <li key={c}>
              <strong>Colour {c + 1}:</strong> {gs.map(grp).join(", ")}
            </li>
          ))}
        </ul>
        <p className="font-semibold">Your {graph.daysUsed} training days (each muscle group gets a day):</p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {graph.schedule.groups.map((gs, d) => (
            <li key={d} className="rounded-xl bg-white px-4 py-2">
              <strong>Training day {d + 1}:</strong> {gs.map(grp).join(" + ") || "—"}
            </li>
          ))}
        </ol>
        <p className="text-base text-muted">
          Conflicting groups on the same day: {graph.schedule.sameDayClashes}. Conflicting groups on back-to-back days:{" "}
          {graph.schedule.consecutiveClashes} (the program tries every possible schedule and keeps the one with the fewest).
          {graph.daysUsed < graph.chromaticNumber &&
            ` You train on fewer days than χ = ${graph.chromaticNumber}, so a same-day clash cannot be avoided.`} Your final plan may also add a
          second helping of a muscle group on a day with spare time, but only a group that does not conflict with the ones around it.
        </p>
      </Concept>

      {/* ---------------- 5. COMBINATORICS ---------------- */}
      <Concept
        id="counting"
        number={5}
        title="Combinatorics and the pigeonhole principle"
        where="Counting how many different plans were possible, and knowing when repeats cannot be avoided."
        simple={
          <>
            <p>
              <strong>Combinatorics</strong> is the maths of counting. If you choose <em>k</em> things from <em>n</em> and the order does not
              matter, the number of ways is written C(n, k). When choices are made one after another, you <strong>multiply</strong> the counts.
            </p>
            <p>
              The <strong>pigeonhole principle</strong>: if you put more pigeons than holes, some hole gets at least two pigeons. It sounds
              obvious, but it proves that some repeats cannot be avoided.
            </p>
          </>
        }
        formula={
          <Formula>
            C(n, k) = n! / ( k! × (n − k)! )<br />
            Product rule: total plans = C(n₁, k₁) × C(n₂, k₂) × …<br />
            Pigeonhole: more than m items in m boxes ⟹ some box holds at least ⌈items ÷ boxes⌉
          </Formula>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-base">
            <caption className="mb-2 text-left text-muted">How many ways were there to choose each day&apos;s exercises?</caption>
            <thead>
              <tr className="bg-white">
                {["Day", "Muscle groups", "Usable (n)", "Picked (k)", "C(n, k)"].map((h) => (
                  <th key={h} scope="col" className="border border-gray-300 px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {counting.pools.map((p) => (
                <tr key={p.day} className="bg-white">
                  <td className="border border-gray-300 px-3 py-2">{p.day}</td>
                  <td className="border border-gray-300 px-3 py-2">{p.groups.map(grp).join(" + ")}</td>
                  <td className="border border-gray-300 px-3 py-2">{p.available}</td>
                  <td className="border border-gray-300 px-3 py-2">{p.picks}</td>
                  <td className="border border-gray-300 px-3 py-2 font-mono">{big(p.ways)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          By the product rule there were <strong className="break-all font-mono">{big(counting.totalPlans)}</strong> different sets of exercises
          for your week of this size. The maths (the knapsack, coming in concept 7) picked the best one.
        </p>
        <p>
          You also chose {counting.weekdayChoices.days} training days. The number of ways to pick which days of the week is C(7,{" "}
          {counting.weekdayChoices.days}) = <strong>{big(counting.weekdayChoices.ways)}</strong>.
        </p>
        <div className="rounded-xl bg-white p-4">
          <p className="font-semibold">Pigeonhole in your plan</p>
          <p className="mt-2">
            {counting.groupsIntoDays.repeatForced
              ? `You have ${counting.groupsIntoDays.items} muscle groups (pigeons) but only ${counting.groupsIntoDays.boxes} training days (holes). So some day must hold at least ${counting.groupsIntoDays.atLeastInSomeBox} groups. That is forced by the pigeonhole principle, not a choice.`
              : `You have ${counting.groupsIntoDays.items} muscle groups and ${counting.groupsIntoDays.boxes} training days, so no day is forced to hold two groups.`}
          </p>
          <p className="mt-2">
            {counting.slotsIntoExercises.repeatForced
              ? `Your week has ${counting.slotsIntoExercises.items} exercise slots but only ${counting.slotsIntoExercises.boxes} different usable exercises, so at least one exercise must appear twice.`
              : `Your week has ${counting.slotsIntoExercises.items} exercise slots and ${counting.slotsIntoExercises.boxes} different usable exercises, so pigeonhole does not force a repeat. (If you had a very long session with very few exercises, it would.)`}
          </p>
        </div>
      </Concept>

      {/* ---------------- 6. RECURRENCE ---------------- */}
      <Concept
        id="recurrence"
        number={6}
        title="Recurrence relations and induction"
        where="Making your workouts a little harder each week (progressive overload)."
        simple={
          <>
            <p>
              A <strong>recurrence relation</strong> describes each step using the one before it. To improve safely, we add a small amount each
              week: this week&apos;s target = last week&apos;s target + d.
            </p>
            <p>
              A <strong>closed form</strong> is a shortcut formula that jumps straight to any week. <strong>Induction</strong> is how we prove the
              shortcut is always right: show it works at the start, then show that if it works for one week it works for the next.
            </p>
          </>
        }
        formula={
          <Formula>
            Recurrence: W(n) = W(n − 1) + d, starting from W(0)<br />
            Closed form: W(n) = W(0) + n × d
          </Formula>
        }
      >
        <p>
          Example from your plan: <strong>{recurrence.exerciseName}</strong>. Starting target W(0) = <strong>{recurrence.w0}</strong>{" "}
          {recurrence.unit === "seconds" ? "seconds" : "reps"}, adding d = <strong>{recurrence.d}</strong> each week.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[380px] border-collapse text-center text-base">
            <thead>
              <tr className="bg-white">
                <th scope="col" className="border border-gray-300 px-3 py-2">Week n</th>
                <th scope="col" className="border border-gray-300 px-3 py-2">By recurrence</th>
                <th scope="col" className="border border-gray-300 px-3 py-2">
                  By closed form {recurrence.w0} + n × {recurrence.d}
                </th>
              </tr>
            </thead>
            <tbody>
              {recurrence.weeks.map((w) => (
                <tr key={w.n} className={w.n === recurrence.currentWeek ? "bg-accent font-semibold text-white" : "bg-white"}>
                  <td className="border border-gray-300 px-3 py-2">{w.n}</td>
                  <td className="border border-gray-300 px-3 py-2 font-mono">{w.recurrence}</td>
                  <td className="border border-gray-300 px-3 py-2 font-mono">{w.closedForm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          You are in week n = <strong>{recurrence.currentWeek}</strong> of your plan, so your target is W({recurrence.currentWeek}) ={" "}
          <strong>{recurrence.currentValue}</strong>.{" "}
          <span className="text-base text-muted">
            (To keep things safe the app stops increasing at {recurrence.cap}, so the maths shown is the pure formula.)
          </span>
        </p>
        <div className="rounded-xl bg-white p-4">
          <p className="font-semibold">Proof by induction</p>
          <p className="mt-2 font-mono text-base">{recurrence.proof.claim}</p>
          <p className="mt-3">
            <strong>1. Base case.</strong> {recurrence.proof.base.text} {recurrence.proof.base.holds ? "✓" : "✗"}
          </p>
          <p className="mt-3">
            <strong>2. Inductive step.</strong> {recurrence.proof.hypothesis}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-gray-100 p-3 font-mono text-sm leading-relaxed">{recurrence.proof.stepLines.join("\n")}</pre>
          <p className="mt-3">
            <strong>3. Conclusion.</strong> {recurrence.proof.conclusion}
          </p>
          <p className="mt-3 text-base text-muted">
            As a double-check the program compared both methods for weeks 0 to {recurrence.proof.checkedUpTo}: they agree{" "}
            {recurrence.proof.allAgree ? "every time ✓" : "✗"}.
          </p>
        </div>

        {/* Double progression: a piecewise recurrence on the weight lifted */}
        <div className="rounded-xl bg-white p-4">
          <p className="text-lg font-semibold">Weights: a piecewise recurrence (&quot;double progression&quot;)</p>
          <p className="mt-2">
            For dumbbell and gym exercises you can write down the weight you used. The suggested weight for next time follows a rule with
            two cases:
          </p>
          <Formula>
            W(n + 1) = W(n) + Δ   if you managed all the target reps<br />
            W(n + 1) = W(n)       otherwise   (Δ = {WEIGHT_STEP[profile.units]} {profile.units})
          </Formula>
          <p className="text-base text-muted">
            So the reps rise first (the plan&apos;s own recurrence), and the weight only goes up once you can do them all. The weight never goes
            down.
          </p>
          {lastLift && liftName ? (
            <p className="mt-3">
              Your latest: <strong>{liftName}</strong> at W(n) = {fromKg(lastLift.weightKg!, profile.units)} {profile.units}, with{" "}
              {lastLift.amount ?? "?"} reps done out of a target of {lastLift.target}.{" "}
              {lastLift.amount !== null && lastLift.amount >= lastLift.target!
                ? "All reps done, so the first case applies:"
                : "Not all reps yet, so the second case applies:"}{" "}
              W(n + 1) ={" "}
              <strong>
                {suggestNextWeight(fromKg(lastLift.weightKg!, profile.units), lastLift.amount, lastLift.target, WEIGHT_STEP[profile.units])}{" "}
                {profile.units}
              </strong>
              .
            </p>
          ) : (
            <p className="mt-3">
              You have not logged a weight yet. Finish a dumbbell or gym exercise and enter the weight, and your own example will appear here.
            </p>
          )}
        </div>

        {/* Adaptive overload: the step changes with the user's feedback */}
        <div className="rounded-xl bg-white p-4">
          <p className="text-lg font-semibold">The adaptive version: your feedback changes the step</p>
          <p className="mt-2">
            After each finished workout day you can say it felt <strong>too easy</strong>, <strong>just right</strong> or{" "}
            <strong>too hard</strong>. The answers of one week decide the multiplier m for the next week:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>mostly too easy → m = 2 (step up twice as fast)</li>
            <li>just right, a tie, or no answer → m = 1 (normal step)</li>
            <li>mostly too hard → m = 0 (hold: same numbers again)</li>
          </ul>
          <Formula>
            Recurrence: W(n) = W(n − 1) + mₙ × d<br />
            Closed form: W(n) = W(0) + d × S(n), where S(n) = m₁ + m₂ + … + mₙ<br />
            Bounds: every m is 0, 1 or 2, so W(0) ≤ W(n) ≤ W(0) + 2 × n × d
          </Formula>
          <p className="text-base text-muted">
            The fixed plan above is the special case where every m = 1, so S(n) = n.
          </p>

          {recurrence.adaptive.multipliers.length === 0 ? (
            <p className="mt-3">
              This is the first week of your plan, so there are no earlier weeks yet. Rate your workouts this week, and next week your
              multiplier m₁ will appear here.
            </p>
          ) : (
            <>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-center text-base">
                  <thead>
                    <tr>
                      <th scope="col" className="border border-gray-300 px-3 py-2">Week n</th>
                      <th scope="col" className="border border-gray-300 px-3 py-2">How the week before felt</th>
                      <th scope="col" className="border border-gray-300 px-3 py-2">mₙ</th>
                      <th scope="col" className="border border-gray-300 px-3 py-2">W(n)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">0</td>
                      <td className="border border-gray-300 px-3 py-2">(start)</td>
                      <td className="border border-gray-300 px-3 py-2">–</td>
                      <td className="border border-gray-300 px-3 py-2 font-mono">{recurrence.adaptive.sequence[0]}</td>
                    </tr>
                    {recurrence.adaptive.multipliers.map((m, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 px-3 py-2">{i + 1}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          {m === 2 ? "mostly too easy" : m === 0 ? "mostly too hard" : "just right / not rated"}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-mono">{m}</td>
                        <td className="border border-gray-300 px-3 py-2 font-mono">{recurrence.adaptive.sequence[i + 1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                S({recurrence.adaptive.multipliers.length}) = {recurrence.adaptive.multipliers.join(" + ")} ={" "}
                <strong>{recurrence.adaptive.steps}</strong>, so W({recurrence.adaptive.multipliers.length}) = {recurrence.w0} + {recurrence.d} ×{" "}
                {recurrence.adaptive.steps} ={" "}
                <strong>{recurrence.w0 + recurrence.d * recurrence.adaptive.steps}</strong>. Without feedback it would have been {recurrence.w0}{" "}
                + {recurrence.d} × {recurrence.adaptive.multipliers.length} = {recurrence.w0 + recurrence.d * recurrence.adaptive.multipliers.length}.
              </p>
            </>
          )}

          <p className="mt-4 font-semibold">Proof by induction (adaptive version)</p>
          <p className="mt-1 font-mono text-base">{recurrence.adaptive.proof.claim}</p>
          <p className="mt-2">
            <strong>1. Base case.</strong> {recurrence.adaptive.proof.base.text} ✓
          </p>
          <p className="mt-2">
            <strong>2. Inductive step.</strong> {recurrence.adaptive.proof.hypothesis}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-gray-100 p-3 font-mono text-sm leading-relaxed">
            {recurrence.adaptive.proof.stepLines.join("\n")}
          </pre>
          <p className="mt-2">
            <strong>3. Conclusion.</strong> {recurrence.adaptive.proof.conclusion}
          </p>
          <p className="mt-2 text-base text-muted">
            Checked by the program for your {recurrence.adaptive.multipliers.length + 1} week
            {recurrence.adaptive.multipliers.length === 0 ? "" : "s"} so far:{" "}
            {recurrence.adaptive.proof.allAgree ? "recurrence and closed form agree ✓" : "✗"}.
          </p>
        </div>
      </Concept>

      {/* ---------------- 7. KNAPSACK ---------------- */}
      <Concept
        id="knapsack"
        number={7}
        title="Dynamic programming: the 0/1 knapsack"
        where="Choosing the exercises that give you the most benefit within your time limit for each workout day."
        simple={
          <>
            <p>
              Imagine packing a bag that can hold only so much. Each exercise &quot;weighs&quot; some minutes and gives some &quot;benefit&quot;. You may
              take each exercise once (0 or 1 times). Which exercises give the most benefit without going over your time?
            </p>
            <p>
              Trying every combination would take far too long. <strong>Dynamic programming</strong> solves small versions first (fewer
              exercises, fewer minutes), writes the answers in a table, and reuses them to build the big answer.
            </p>
          </>
        }
        formula={
          <>
            <Formula>
              best(i, t) = best benefit using the first i exercises within t minutes<br />
              best(0, t) = 0<br />
              best(i, t) = best(i − 1, t)  if exercise i does not fit<br />
              best(i, t) = max( best(i − 1, t), best(i − 1, t − minutes<sub>i</sub>) + benefit<sub>i</sub> )  otherwise
            </Formula>
            <p className="text-muted">
              &quot;Skip it&quot; or &quot;take it&quot;: for each cell we pick whichever is better.
            </p>
          </>
        }
      >
        {knap ? (
          <>
            <p>
              Here is the table for a small version of <strong>your day 1</strong>: your {knap.items.length} highest-benefit exercises for that
              day, with {knap.capacity} minutes.
            </p>
            <div className="rounded-xl bg-white p-3">
              <KnapsackTable items={knap.items} result={knap.result} capacity={knap.capacity} />
            </div>
            <p>
              Best benefit: <strong>{knap.result.bestValue}</strong> using{" "}
              <strong>{knap.result.totalWeight} of {knap.capacity} minutes</strong>. Taken:{" "}
              {knap.result.chosenIds.length
                ? knap.items.filter((i) => knap.result.chosenIds.includes(i.id)).map((i) => i.name).join(", ")
                : "nothing fits"}
              .
            </p>
            <div className="rounded-xl bg-white p-4">
              <p className="font-semibold">The same idea on your real day 1 ({knap.fullDay.capacity} minutes)</p>
              <p className="mt-1 text-base text-muted">
                Capacity T = your {knap.fullDay.capacity + 5} minutes − 5 minutes kept for the warm-up and cool-down = {knap.fullDay.capacity}{" "}
                minutes.
              </p>
              <p className="mt-2">
                The knapsack chose <strong>{knap.fullDay.names.length}</strong> exercises worth a total benefit of{" "}
                <strong>{knap.fullDay.benefit}</strong> in <strong>{knap.fullDay.totalMin}</strong> minutes:
              </p>
              <p className="mt-2 flex flex-wrap gap-2">
                {knap.fullDay.names.map((n) => (
                  <Chip key={n}>{n}</Chip>
                ))}
              </p>
              <p className="mt-2 text-base text-muted">
                Your final plan also makes sure each muscle group of the day appears, and can add extra exercises if you have spare minutes.
              </p>
            </div>
          </>
        ) : (
          <p>Your plan has no workout days yet, so there is nothing to optimise.</p>
        )}
      </Concept>

      <p className="border-t-2 border-gray-200 pt-6 text-base text-muted">
        Every calculation on this page comes from the functions in <code>src/lib/math</code>, which have automated tests. FitPath gives general
        fitness ideas, not medical advice. If you have pain, an injury or a health condition, please check with a doctor or physio.
      </p>
    </div>
  );
}
