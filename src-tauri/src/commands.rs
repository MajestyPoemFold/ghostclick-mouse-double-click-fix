//! Tauri commands: the only surface the UI can call. Keep them thin; the logic lives in
//! `ghostclick-core` and the Windows-specific code in its own modules.

use serde::Serialize;

use crate::error::AppResult;

#[derive(Debug, Serialize)]
pub struct AppInfo {
    pub name: &'static str,
    pub version: &'static str,
}

#[tauri::command]
pub fn app_info() -> AppResult<AppInfo> {
    Ok(AppInfo {
        name: "GhostClick",
        version: ghostclick_core::VERSION,
    })
}
