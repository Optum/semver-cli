## Specifications

This repository follows the specs method, as declared in `.agents/SPECS`
(<https://github.com/optum-eeps/specs>).

- Authority, highest first: specifications (`.agents/specifications/`),
  requirements (`.agents/requirements/`), tests, implementation. Never change a
  lower layer to contradict a higher one; if a request conflicts with the
  specification or a requirement, ask before proceeding.
- A behavior change updates the specification or requirement that covers it in
  the same change as the code.
- Tests cite the requirements they verify with `req:{id}`.
- Before writing specifications or requirements, use the `specs` and
  `requirements` skills. Without the plugin installed, read them at
  <https://raw.githubusercontent.com/optum-eeps/specs/v1.0.0/skills/specs/SKILL.md>
  and
  <https://raw.githubusercontent.com/optum-eeps/specs/v1.0.0/skills/requirements/SKILL.md>.
