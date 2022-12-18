#include "backend.hpp"
#include "gecode-solver.hpp"

#include <mutex>
#include <cstring>

Solver* solver_new(SolverId id) {
    // TODO: only gecode for now, so no need to check the id
    return new GecodeSolver();
}

size_t solver_solve(Solver* solver, int32_t queens) {
    return solver->solve(queens);
}

size_t solver_get_num_solutions(Solver* solver) {
    std::lock_guard<std::mutex> guard(solver->mutex);
    return solver->solutions.size();
}

void solver_get_solution(Solver* solver, size_t index, uint8_t* result) {
    std::lock_guard<std::mutex> guard(solver->mutex);
    auto solution_ref = solver->solutions.at(index);
    std::memcpy(result, solution_ref.data(), solution_ref.size());
}

void solver_cancel(Solver* solver) {
    std::lock_guard<std::mutex> guard(solver->mutex);
    solver->cancel = true;
}

void solver_delete(Solver* solver) {
    delete solver;
}