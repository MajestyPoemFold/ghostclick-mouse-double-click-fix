//! GhostClick core.
//!
//! Mouse double-click test and system-wide ghost click filter.
//!
//! Everything here is plain Rust with no Windows or UI dependencies, so it can be unit tested on
//! any machine. The Tauri shell in `src-tauri` calls into this crate.

/// Crate version, shown in the app's About box and in exported reports.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
