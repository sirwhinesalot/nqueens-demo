// To remove the console window on Windows
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::atomic::{AtomicI32, Ordering};

extern crate link_cplusplus;

#[repr(C)]
struct Solver { private: [u8; 0] }

#[repr(C)]
enum SolverId {
    GECODE,
}

#[link(name = "backend", kind="static")]
extern "C" {
    fn solver_new(id: SolverId) -> *mut Solver;
    fn solver_solve(solver: *mut Solver, queens: i32) -> usize;
    fn solver_get_num_solutions(solver: *mut Solver) -> usize;
    fn solver_get_solution(solver: *mut Solver, index: usize, result: *mut u8);
    fn solver_cancel(solver: *mut Solver);
    // fn solver_delete(solver: *mut Solver);
}

struct AppState {
    queens: AtomicI32,
    solver: *mut Solver,
}

unsafe impl Send for AppState {}
unsafe impl Sync for AppState {}

#[tauri::command]
fn show_window(window: tauri::Window) {
    window.show().unwrap();
}

#[tauri::command]
async fn solve(state: tauri::State<'_, AppState>, queens: i32) -> Result<usize, ()> {
    state.queens.store(queens, Ordering::Relaxed);
    unsafe {
        return Ok(solver_solve(state.solver, queens));
    }
}

#[tauri::command]
fn get_num_solutions(state: tauri::State<AppState>) -> usize {
    unsafe {
        return solver_get_num_solutions(state.solver)
    }
}

#[tauri::command]
fn get_solution(state: tauri::State<AppState>, index: usize) -> Vec<u8> {
    let mut result = vec![0; state.queens.load(Ordering::Relaxed) as usize];
    unsafe {
        solver_get_solution(state.solver, index, result.as_mut_ptr());
        return result;
    }
}

#[tauri::command]
fn cancel(state: tauri::State<AppState>) {
    unsafe {
        solver_cancel(state.solver);
    }
}

fn main() {
    tauri::Builder::default()
        .manage(AppState{
            queens: 0.into(),
            solver: unsafe {solver_new(SolverId::GECODE)}
        })
        .invoke_handler(tauri::generate_handler![
            show_window,
            solve,
            get_num_solutions,
            get_solution,
            cancel,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
