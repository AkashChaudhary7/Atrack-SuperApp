# Security Specification for Atrack (Firestore Security)

This specification defines the strict security boundary, data invariants, and the threat model ("Dirty Dozen" payloads) designed to test the mathematical integrity of the security rules.

## 1. Data Invariants

For all collections (e.g., `expenses`, `bills`, `habits`, `intimacyLogs`, `jerkOffLogs`, `medicines`, `weightRecords`, `workouts`, `tasks`, `studySessions`, `passwords`, `documents`, `personalIDs`, `assetAccounts`, `goals`):
- **Universal Ownership Restriction:** Any document written to Firestore MUST contain a `userId` field matching `request.auth.uid`. No user can read, create, update, or delete other users' documents.
- **Strict Key Control (The "Shadow Update" Gate):** Schema-level key validation forces exact key list size on create. Unrecognized "ghost fields" (e.g., `isAdmin: true` or `role: "admin"`) are strictly blocked.
- **Temporal Integrity:** `createdAt` is immutable and must equal `request.time` upon creation (for entities with timestamps). `updatedAt` (if present) must equal `request.time` on updates.
- **Non-Relational Leak Isolation:** Personal private data (such as vault passwords, personal IDs, secure documents containing PII) is isolated per-user under strict `userId == request.auth.uid` validation.

---

## 2. The "Dirty Dozen" Payloads

Here are twelve highly specific attack payloads attempting to break identity, integrity, and state logic constraints inside the `firestore.rules`:

### Threat Category A: Identity Spoofing & Privilege Escalation
1. **Payload 1 (Ghost Field Injection):** Attempts to set client-provided privilege flags.
   ```json
   {
     "id": "exp_101",
     "userId": "user_victim",
     "amount": 25.5,
     "category": "Food",
     "description": "Ghost Lunch",
     "date": "2026-06-12",
     "isAdmin": true
   }
   ```
2. **Payload 2 (Immutability / Hijack Attack):** Attempts to modify `userId` after creation on an expense.
   ```json
   {
     "id": "exp_existing_1",
     "userId": "attacker_uid"
   }
   ```
3. **Payload 3 (Verification Spoofing):** Attempts to write to personal records with an email-spoofed unverified session context (`request.auth.token.email_verified == false`).

### Threat Category B: Value and Type Poisoning
4. **Payload 4 (Resource Poisoning via Gigantic ID):** Injecting extremely long ID structures to cause storage size escalation.
   ```json
   {
     "id": "some_extra_long_string_of_1000_junk_characters_...",
     "userId": "user_attacker"
   }
   ```
5. **Payload 5 (Extreme Value Denial of Wallet):** Logging an expense with a negative amount or extremely high numeric overflow.
   ```json
   {
     "id": "exp_102",
     "userId": "user_attacker",
     "amount": -999999999,
     "category": "Food",
     "description": "Malicious Bill",
     "date": "2026-06-12"
   }
   ```
6. **Payload 6 (Type Poisoning - String Arrays):** Attempting to write a boolean structure into array fields.
   ```json
   {
     "id": "habit_101",
     "name": "Exercise",
     "completedDates": true,
     "createdAt": "2026-06-12",
     "streak": 5
   }
   ```

### Threat Category C: Temporal Violations & State Corruption
7. **Payload 7 (Spoofed Future/Past Timestamps):** Forcing custom `createdAt` values rather than server-determined ones.
   ```json
   {
     "id": "goal_101",
     "title": "Save Money",
     "category": "Financial",
     "targetValue": 5000,
     "currentValue": 10,
     "unit": "USD",
     "targetDate": "2027-12-31",
     "createdAt": "2000-01-01T00:00:00Z"
   }
   ```
8. **Payload 8 (Orphaned Record Creation):** Attempting to write a subcollection item/related model pointing to a victim's parent record.

### Threat Category D: Vault & PII Exposure
9. **Payload 9 (Cross-User Password Scraping):** Attacker querying other users' passwords or documents collection without specifying their own `userId` in filters.
10. **Payload 10 (Spoofed Document Profile):** Attacker attempting to write to `documents` under a different `profileId` of another user.
11. **Payload 11 (Secure Vault Bypass):** Attacker trying to fetch a password record belonging to another user.
12. **Payload 12 (Self-Assigned Admin privileges):** Attacker attempting to make a write to an `admins` collection document to acquire global permissions.

---

## 3. Test Coverage Verification Structure

These payloads are validated via unit tests which assert that trying to write or list these elements yields a strict `PERMISSION_DENIED` error. We maintain security integrity through the zero-trust `firestore.rules`.
