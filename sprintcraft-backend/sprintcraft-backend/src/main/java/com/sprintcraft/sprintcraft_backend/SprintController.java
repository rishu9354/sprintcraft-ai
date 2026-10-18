package com.sprintcraft;

import com.sprintcraft.Dto.*;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SprintController {
    private final SprintService service;

    public SprintController(SprintService service) {
        this.service = service;
    }

    /** Powers the amber "Spec Ambiguities" card. */
    @PostMapping("/spec/audit")
    SpecAudit audit(@Valid @RequestBody SpecRequest req) {
        return service.audit(req.spec());
    }

    /** "Auto-Fix Spec with AI" button. */
    @PostMapping("/spec/autofix")
    Map<String, String> autoFix(@Valid @RequestBody AutoFixRequest req) {
        return Map.of("spec", service.autoFix(req.spec(), req.ambiguities()));
    }

    /** "Generate Backlog": epics/stories plus DAG with critical path. */
    @PostMapping("/sprint/generate")
    SprintPlan generate(@Valid @RequestBody SpecRequest req) {
        return service.generate(req.spec());
    }

    // Bad LLM output (cycles etc.) surfaces as a readable 422 instead of a 500
    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    Map<String, String> invalid(IllegalStateException e) {
        return Map.of("error", e.getMessage());
    }
}
