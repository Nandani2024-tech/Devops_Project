# Sample Project for BugBoard Testing

This is a sample FastAPI service representing a user management microservice.
It contains intentional bugs for testing BugBoard's deterministic static analysis engine.

## Known Bugs
1. **Duplicate Email Registration Bug**: Located in `app/users.py` at line 18. Registration does not check if an email already exists in the database/in-memory store, leading to unhandled duplicate state.
2. **Missing Null Check Bug**: Located in `app/users.py` at line 34. Calling user profile attributes assumes user profile always exists when user is fetched, resulting in `NoneType` attribute access errors.
