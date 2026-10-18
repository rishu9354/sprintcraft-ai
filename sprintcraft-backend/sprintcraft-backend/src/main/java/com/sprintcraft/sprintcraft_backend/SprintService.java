package com.sprintcraft;

import com.sprintcraft.Dto.*;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class SprintService {
    private static final int[] FIB = {1, 2, 3, 5, 8, 13};

    private final SprintArchitect architect;
    private final DagService dagService;

    public SprintService(SprintArchitect architect, DagService dagService) {
        this.architect = architect;
        this.dagService = dagService;
    }

    public SpecAudit audit(String spec) {
        return architect.audit(spec);
    }

    public String autoFix(String spec, List<Ambiguity> gaps) {
        // Re-audit when the client did not pass its own list
        List<Ambiguity> list = (gaps == null || gaps.isEmpty()) ? audit(spec).ambiguities() : gaps;
        return architect.autoFix(spec, list.stream().map(a -> "- " + a.text()).collect(Collectors.joining("\n")));
    }

    public SprintPlan generate(String spec) {
        Backlog raw = architect.generateBacklog(spec);
        // LLM output is untrusted: snap points to Fibonacci, default nulls, then compute the DAG
        Backlog clean = new Backlog(raw.epics().stream()
            .map(e -> new Epic(e.title(), e.stories().stream().map(this::normalize).toList())).toList());
        return new SprintPlan(clean, dagService.build(clean));
    }

    private Story normalize(Story s) {
        int pts = FIB[0];
        for (int f : FIB) if (Math.abs(f - s.points()) < Math.abs(pts - s.points())) pts = f;
        return new Story(s.id(), s.title(), s.description(), pts, s.tag(),
            "High".equalsIgnoreCase(s.priority()) ? "High" : "Medium",
            orEmpty(s.dependsOn()), orEmpty(s.acceptanceCriteria()), orEmpty(s.subtasks()));
    }

    private static List<String> orEmpty(List<String> l) {
        return l == null ? List.of() : l;
    }
}
