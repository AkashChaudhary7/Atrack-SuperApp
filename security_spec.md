# Security Spec for Atrack Firebase Synchronization Schema

## 1. Data Invariants
- Each user's telemetry records, study sessions, bills, and intimacy records belong strictly to that user's partition `users/{userId}`.
- Relational access checks prevent user A from reading, writing, updating, or deleting any document belonging to user B.
- Immutable system and metadata timestamps require that records conform to `request.auth.uid == userId`.

## 2. The Dirty Dozen Payloads (Security Penetration Test Scenarios)

1. **Identity Spoofing on Expenses**: User A tries to write to `/users/UserB/expenses/expense1` with User A's auth token.
   - Result: `PERMISSION_DENIED`
2. **Identity Spoofing on Secure Passwords**: User A tries to view `/users/UserB/passwords/pass1` with User A's auth token.
   - Result: `PERMISSION_DENIED`
3. **Identity Spoofing on Document Storage**: User A tries to delete a Base64 secure certificate at `/users/UserB/documents/doc1`.
   - Result: `PERMISSION_DENIED`
4. **Identity Spoofing on Weight History**: User A tries to append weight logs to `/users/UserB/weightRecords/rec1`.
   - Result: `PERMISSION_DENIED`
5. **Anonymous Poisoning**: Unauthenticated client attempts to create a document at `/users/UserA/habits/habit1`.
   - Result: `PERMISSION_DENIED`
6. **Root Escalation**: Malicious user attempts to read database root lists `/users`.
   - Result: `PERMISSION_DENIED`
7. **Personal ID Extraction**: User A attempts to list User B's secure IDs `/users/UserB/personalIDs`.
   - Result: `PERMISSION_DENIED`
8. **Stamina Workout Modification**: User A tries to modify exercise count at `/users/UserB/workouts/log1`.
   - Result: `PERMISSION_DENIED`
9. **Dosing Records Tampering**: User A attempts to edit medicine intake frequency under `/users/UserB/medicines/med1`.
   - Result: `PERMISSION_DENIED`
10. **Study Log Injection**: User A attempts to insert study hours under `/users/UserB/studySessions/sess1`.
    - Result: `PERMISSION_DENIED`
11. **Retentive Reset Interception**: User A attempts to read User B's JerkOffLogs under `/users/UserB/jerkOffLogs/log1`.
    - Result: `PERMISSION_DENIED`
12. **Master Safety Denial**: Any client attempts to perform a raw write to unmapped collections (e.g., `/unmapped_collection/doc1`).
    - Result: `PERMISSION_DENIED`

## 3. Security Rules Draft Code

The rules are mapped out and tested in `firestore.rules` under absolute path validation.
