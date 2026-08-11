# Storage plan

The migration creates bucket definitions only; it creates no `storage.objects` upload, update, or delete policies.

| Bucket | Readability | Planned writers |
| --- | --- | --- |
| `car-images` | Public, so active marketplace listing images can be displayed without signed URLs. | Authenticated listing owners, constrained to their own car path. |
| `avatars` | Public, so profile avatars can be displayed. | Authenticated profile owners, constrained to their own user-id path. |
| `inspection-images` | Private. Access will use RLS and/or short-lived signed URLs. | Assigned inspectors and authorised admins only. |

Object-path and upload policies belong to the authentication and authorisation phase. Public readability never grants public upload access.
