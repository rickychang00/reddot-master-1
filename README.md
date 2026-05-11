# 🔴 RedDot Master Template (Next.js + PocketBase)

A high-performance, "One-Click" deployable landing page engine with integrated **Red Dot Payment** and a powerful **No-Code Admin Hub**.

## 🚀 One-Click Launch

1.  **Clone** this repository.
2.  **Configure** the `.env` file:
    *   Set `COMPOSE_PROJECT_NAME` (e.g., `my_client_project`).
    *   Add your `RDP_MERCHANT_ID` and `RDP_SECRET_KEY`.
3.  **Run** the launch command:
    ```bash
    docker-compose up -d --build
    ```
4.  **Setup PocketBase**:
    *   Visit `http://localhost:8090/_/` and create your **Admin Account**.
    *   *Note: All collections and API rules are created automatically via migrations on first launch!*

## 🏗️ Architecture

-   **Frontend**: Next.js 15 (Port 9002) - Ultra-fast, SEO-optimized.
-   **Backend**: PocketBase (Port 8090) - Handles Database, Auth, and File Storage.
-   **Isolation**: Uses `COMPOSE_PROJECT_NAME` for 100% independent project instances on the same server.
-   **Automation**: Includes `pb_migrations` to auto-initialize the database schema.

## 🎨 Master Admin Hub (Port 9002/admin)

Once logged in, you can manage the following without touching any code:

*   **Navigation**: Add/Delete/Reorder top nav links.
*   **Branding**: Update Company Name and upload a Logo.
*   **Hero Section**: 
    *   Edit Title, Subtitle, and dynamic Badge.
    *   Add unlimited Call-to-Action buttons with custom links.
    *   Upload high-res background images.
*   **Membership Tiers**:
    *   Create dynamic Pricing Tiers (Monthly, Yearly, One-time).
    *   Toggle Visibility (Hide/Show tiers).
    *   Manage individual "Checkmark" features for every tier.
*   **Payments Ledger**: Live audit of all Red Dot Payment transactions (CIT and MIT).
*   **Member Database**: Manage registered users and trigger **Manual MIT Billing**.

## 💳 Payment Integration

Integrated with **Red Dot Payment (RDP)** Sandbox/Production:
*   **CIT (Customer Initiated)**: Standard registration flow.
*   **MIT (Merchant Initiated)**: One-click "Authorize" billing from the Admin Hub using Payer ID.
*   **Webhook Support**: Automated status updates for background payments.

## 🔒 Security & Deployment

*   **GitHub Ready**: Root `.gitignore` ensures `.env` and `pb_data` (local test data) are never pushed.
*   **Production Build**: Docker uses a multi-stage build to minimize image size and maximize security.

---

