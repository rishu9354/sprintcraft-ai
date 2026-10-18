package com.sprintcraft;

import com.sprintcraft.Dto.*;
import java.util.*;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;

/** Builds the dependency graph and finds the critical path (heaviest dependency chain by story points). */
@Service
public class DagService {

    public Dag build(Backlog backlog) {
        Map<String, Story> byId = new LinkedHashMap<>();
        backlog.epics().stream().flatMap(e -> e.stories().stream()).forEach(s -> byId.put(s.id(), s));

        Map<String, Integer> best = new HashMap<>();   // heaviest chain ending at this story
        Map<String, String> prev = new HashMap<>();    // predecessor on that chain
        byId.keySet().forEach(id -> longest(id, byId, best, prev, new HashSet<>()));

        // Walk back from the heaviest tail to collect the critical path
        String tail = Collections.max(best.entrySet(), Map.Entry.comparingByValue()).getKey();
        Set<String> critical = new LinkedHashSet<>();
        for (String id = tail; id != null; id = prev.get(id)) critical.add(id);

        List<DagNode> nodes = byId.values().stream()
            .map(s -> new DagNode(s.id(), s.title(), s.points(), critical.contains(s.id()))).toList();
        List<DagEdge> edges = byId.values().stream()
            .flatMap(s -> s.dependsOn().stream().filter(byId::containsKey)
                .map(d -> new DagEdge(d, s.id(), critical.contains(s.id()) && d.equals(prev.get(s.id())))))
            .toList();
        return new Dag(nodes, edges, best.get(tail));
    }

    // Memoised DFS; the visiting set turns an LLM-generated cycle into a clear error instead of a stack overflow
    private int longest(String id, Map<String, Story> byId, Map<String, Integer> best,
                        Map<String, String> prev, Set<String> visiting) {
        if (best.containsKey(id)) return best.get(id);
        if (!visiting.add(id)) throw new IllegalStateException("Circular dependency at story " + id);
        int base = 0;
        for (String dep : byId.get(id).dependsOn()) {
            if (!byId.containsKey(dep)) continue;          // ignore hallucinated ids
            int d = longest(dep, byId, best, prev, visiting);
            if (d > base) { base = d; prev.put(id, dep); }
        }
        visiting.remove(id);
        best.put(id, base + byId.get(id).points());
        return best.get(id);
    }
}
