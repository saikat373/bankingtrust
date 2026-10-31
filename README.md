# Aegis Trust Bank - Enterprise Secure Banking Application

A production-grade, enterprise digital banking frontend built with **React**, **TypeScript**, and **Tailwind CSS**. Designed around Defense-in-Depth security principles, multi-tier Role-Based Access Control (RBAC), and automated auditing.

---

## 🚀 Key Features

### 1. Role-Based Access Hierarchy (RBAC)
- **SuperAdmin (`superadmin@aegisbank.com` | PIN: `9988`)**
  - Create and govern **Branch Administrators** (assign departments, branch stations, approval privileges).
  - Configure **Global Risk & Security Policies** (session inactivity timeout, daily withdrawal caps, 2FA enforcement, failed login limits, emergency freeze mode).
  - Inspect the **Global Cryptographic Audit Trail** (real-time ingestion of administrative and financial events with simulated SHA-256 integrity hashes).
  - Monitor aggregate bank liquidity reserves and capital adequacy.

- **Branch Admin (`marcus.vance@aegisbank.com` | PIN: `1234`)**
  - **Open & Approve Customer Accounts**: Register customer profiles, assign account tiers (High-Yield Savings, Premier Checking, Commercial Enterprise, Treasury Money Market), fund initial deposits, and generate 12-digit account numbers.
  - **Account Status Governance**: Instantly **freeze** or **unfreeze** customer accounts during suspicious activity reviews.
  - Inspect local branch transaction ledgers and customer lists.

- **Customer / Retail Client (`alex.wright@executive.io` | PIN: `7788`)**
  - **Multi-Account Overview**: Interactive card visualizer with copyable account numbers and balance privacy toggle.
  - **Money Deposit**: Deposit funds via Direct Wire, Mobile Check (with simulated OCR check scan), or Branch Cash with immediate settlement receipts.
  - **Money Withdrawal**: Enforces daily limits, checks sufficient funds, and requires **Security PIN verification** before debiting.
  - **Transfer Funds**: Internal account re-allocation or transfers to external beneficiaries.
  - **Certified Statement & Print**: Official bank-grade statement generator with bank crest, account summary, debit/credit ledger, and browser print layout optimized for **Print to Paper or Save to PDF**. Also supports CSV export.

---

## 🛡️ Security Measures Implemented

1. **Defense Against Keyloggers & Shoulder Surfing (Virtual PIN Pad)**
   - Keypad randomization option shuffles numeric buttons to prevent pattern recognition.
2. **Idle Inactivity Lockdown**
   - Automatically detects mouse/keyboard inactivity and locks the screen after configurable minutes. Requires PIN re-authentication to resume.
3. **Privacy Mode (Anti-Shoulder Surfing)**
   - One-click toggle in the navbar to mask sensitive monetary balances when browsing in public spaces.
4. **Data Masking**
   - Account numbers displayed as `•••• •••• 4481` with toggle to reveal full numbers on demand. Tax IDs / SSNs masked as `•••-••-4821`.
5. **Brute-Force Lockout Defense**
   - Limits consecutive failed login attempts before locking out the terminal.
6. **Immutable Forensic Audit Trail**
   - Every login, admin creation, customer onboarding, deposit, withdrawal, and statement print is recorded with actor ID, timestamp, IP address, severity (`INFO`, `WARNING`, `CRITICAL`, `SECURITY`), and cryptographic hash.
7. **Official Bank Statement Print Optimization**
   - CSS `@media print` cleanly isolates the statement document, removing web navbars and buttons for clean A4 or PDF output.

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Switcher)

| Role | Name | Email | Default PIN | Initial Balance |
| :--- | :--- | :--- | :--- | :--- |
| **SuperAdmin** | Victoria Sterling | `superadmin@aegisbank.com` | `9988` | System Executive |
| **Branch Admin** | Marcus Vance | `marcus.vance@aegisbank.com` | `1234` | NYC Branch Head |
| **Branch Admin** | Elena Rostova | `elena.rostova@aegisbank.com` | `4321` | SFO Branch Head |
| **Customer** | Alexander Wright | `alex.wright@executive.io` | `7788` | ₹576,151.25 across 3 accounts |
| **Customer** | Sarah Jenkins | `sarah.jenkins@designlab.org` | `1122` | ₹14,230.20 |
| **Customer** | David Chen | `david.chen@chenventures.com` | `5566` | ₹894,500.00 |

> **Tip**: You can switch roles at any time using the **"Switch Role"** button in the top navigation bar or log in directly with any of the emails above.

---

## 💻 How to Run

1. Open your terminal in `d:\react-projects\banking`:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
3. To create a production build:
   ```bash
   npm run build
   ```
