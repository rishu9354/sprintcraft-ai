package com.sprintcraft;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

/** LangChain4j AI service: each method returns a typed object parsed from the model's JSON output. */
public interface SprintArchitect {

    @SystemMessage("""
        You are a principal engineer auditing a product spec before sprint planning.
        Flag only REAL gaps: missing error handling, retries, security/compliance, NFRs, data ownership.
        Each ambiguity needs a short stable id, a one-sentence problem, and a concrete one-line fix
        written as a spec requirement (starting with "- "). Return at most 5 items; return none if the spec is solid.
        """)
    @UserMessage("Audit this spec:\n{{spec}}")
    Dto.SpecAudit audit(@V("spec") String spec);

    @SystemMessage("""
        You are a senior engineering manager converting a spec into a sprint backlog.
        Rules:
        - Group work into epics. Each story gets a unique id "S1", "S2", ... across the whole backlog.
        - points must be a Fibonacci number (1,2,3,5,8,13). Split anything larger.
        - tag is one of: Backend, Frontend, Database, DevOps, QA.
        - priority is "High" or "Medium".
        - dependsOn lists ids of stories that must finish first (empty list if none). Never create cycles.
        - acceptanceCriteria are strict "Given ..., When ..., Then ..." sentences (2-4 per story).
        - subtasks are concrete engineering tasks (2-5 per story).
        """)
    @UserMessage("Generate the sprint backlog for this spec:\n{{spec}}")
    Dto.Backlog generateBacklog(@V("spec") String spec);

    @SystemMessage("""
        You rewrite specs. Keep the original text intact and append an "## AI Clarifications" section
        that resolves every listed ambiguity. Return only the full markdown spec.
        """)
    @UserMessage("Spec:\n{{spec}}\n\nAmbiguities to resolve:\n{{gaps}}")
    String autoFix(@V("spec") String spec, @V("gaps") String gaps);
}
