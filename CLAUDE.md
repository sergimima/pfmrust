# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

Need a diagram of the project

*Session: 6d6a30a57df0df008a5f0ed822982b36 | Generated: 7/5/2025, 10:57:03 AM*

### Analysis Summary

# Project Architecture Diagram

## High-Level Architecture

The project is structured into three primary components: a **Frontend** web application, a **Backend** API server, and a **Voting System** Solana program. These components interact to provide a full-stack decentralized voting platform.

### **Frontend**
*   **Purpose:** The user-facing web application that provides the graphical interface for users to interact with the voting system.
*   **Internal Parts:** Contains the client-side code, typically built with a JavaScript framework like React. Key files are located within the [src/](frontend/src/) directory.
*   **External Relationships:** Communicates with the **Backend** API to fetch data, submit user actions, and manage application state.

### **Backend**
*   **Purpose:** Serves as the central API layer, handling business logic, data persistence, and interaction with the Solana blockchain.
*   **Internal Parts:**
    *   **Entry Point:** The main application starts from [index.ts](backend/src/index.ts).
    *   **Configuration:** Manages settings for various services, including database, Redis, and Solana, defined in [config/](backend/src/config/).
    *   **API Routes:** Defines the RESTful endpoints for the frontend, organized under [routes/](backend/src/routes/), with specific routes for [users](backend/src/routes/api/users.ts), [communities](backend/src/routes/api/communities.ts), and [votes](backend/src/routes/api/votes.ts).
    *   **Services:** Contains core business logic and utility functions, such as [cacheService.ts](backend/src/services/cacheService.ts) and [jobQueue.ts](backend/src/services/jobQueue.ts).
    *   **Jobs:** Handles background tasks like [syncBlockchainData.ts](backend/src/jobs/syncBlockchainData.ts) for synchronizing data from the Solana blockchain, and other scheduled tasks in [jobs/](backend/src/jobs/).
    *   **Listeners:** Monitors on-chain events and updates the backend state, found in [listeners/](backend/src/listeners/).
    *   **Database Schema:** Defined by [schema.prisma](backend/prisma/schema.prisma) for data modeling and migrations.
*   **External Relationships:**
    *   Receives requests from the **Frontend**.
    *   Interacts with a database (managed by Prisma).
    *   Utilizes Redis for caching and job queuing.
    *   Communicates with the Solana blockchain, primarily by interacting with the **Voting System** program.

### **Voting System**
*   **Purpose:** The core smart contract (program) deployed on the Solana blockchain, responsible for the decentralized voting logic and on-chain data management.
*   **Internal Parts:**
    *   **Program Logic:** The main program entry point is [lib.rs](voting-system/programs/voting-system/src/lib.rs).
    *   **Instructions:** Defines the various actions users can perform on-chain, such as [create_community.rs](voting-system/programs/voting-system/src/instructions/create_community.rs) and [create_voting.rs](voting-system/programs/voting-system/src/instructions/create_voting.rs), located in [instructions/](voting-system/programs/voting-system/src/instructions/).
    *   **State Management:** Defines the on-chain data structures for entities like [community](voting-system/programs/voting-system/src/state/community.rs), [user](voting-system/programs/voting-system/src/state/user.rs), [vote](voting-system/programs/voting-system/src/state/vote.rs), and [voting](voting-system/programs/voting-system/src/state/voting.rs), found in [state/](voting-system/programs/voting-system/src/state/).
    *   **Tests:** Contains unit and integration tests for the Solana program, such as [voting-system.ts](voting-system/tests/voting-system.ts).
*   **External Relationships:**
    *   Deployed and executed on the Solana blockchain.
    *   Interacted with by the **Backend** to read on-chain data and send transactions.

## Supporting Components

### **Docs**
*   **Purpose:** Contains project documentation.
*   **Internal Parts:** Includes various Markdown files like [business.md](business.md), [database-architecture.md](database-architecture.md), [project-structure.md](project-structure.md), and [roadmap.md](roadmap.md).

### **Scripts**
*   **Purpose:** Provides utility scripts for development environment setup.
*   **Internal Parts:** Contains shell scripts like [setup-dev-environment.sh](scripts/setup-dev-environment.sh) and PowerShell scripts like [setup-dev-environment.ps1](scripts/setup-dev-environment.ps1).

