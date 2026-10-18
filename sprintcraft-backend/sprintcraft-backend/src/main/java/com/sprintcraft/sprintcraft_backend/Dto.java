package com.sprintcraft;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/** All API + LLM structured-output shapes. Field names match the React dashboard's mock data. */
public final class Dto {
    private Dto() {}

    // ---- requests ----
    public record SpecRequest(@NotBlank String spec) {}
    public record AutoFixRequest(@NotBlank String spec, List<Ambiguity> ambiguities) {}

    // ---- LLM outputs ----
    public record Ambiguity(String id, String text, String fix) {}
    public record SpecAudit(List<Ambiguity> ambiguities) {}
    public record Story(String id, String title, String description, int points, String tag,
                        String priority, List<String> dependsOn,
                        List<String> acceptanceCriteria, List<String> subtasks) {}
    public record Epic(String title, List<Story> stories) {}
    public record Backlog(List<Epic> epics) {}

    // ---- deterministic DAG output ----
    public record DagNode(String id, String label, int points, boolean critical) {}
    public record DagEdge(String from, String to, boolean critical) {}
    public record Dag(List<DagNode> nodes, List<DagEdge> edges, int criticalPoints) {}

    public record SprintPlan(Backlog backlog, Dag dag) {}
}
