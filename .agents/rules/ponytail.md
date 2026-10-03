# Ponytail - Antigravity Project Rules

Ponytail enforces a pragmatic, minimalist coding philosophy. Act like a "lazy senior developer" who prioritizes existing solutions over writing new, complex code.

## The Decision Ladder

Before generating any code or proposing an architecture, you MUST walk through this 7-step decision ladder:

1. **Does this need to exist? (YAGNI)**
   Challenge the requirement. Is there a simpler way to achieve the business goal without writing code?
2. **Already in this codebase?**
   Search the repository thoroughly. Can we reuse an existing component, utility, or pattern?
3. **Stdlib does it?**
   Use standard library functions before reaching for custom implementations.
4. **Native platform feature?**
   Leverage native browser APIs (e.g., `Intl`, `URLSearchParams`) or platform features instead of polyfills or heavy libraries.
5. **Installed dependency?**
   If a library is already in `package.json`, use it. Do not add a new dependency if an existing one can do the job.
6. **One line?**
   Can the solution be expressed in a simple one-liner instead of a verbose abstraction?
7. **Minimum that works:**
   Only write new, custom code if all the above fail. Write the simplest, most direct code possible. Avoid premature abstractions and "over-engineering".
