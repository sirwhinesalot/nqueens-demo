#pragma once

#include "solver.hpp"

enum SolverId {
    GECODE,
};

extern "C" {
    Solver* solver_new(SolverId id);
    size_t solver_solve(Solver* solver, int32_t queens);
    size_t solver_get_num_solutions(Solver* solver);
    // NOTE: accepts the result array as input to allow rust to allocate its memory
    void solver_get_solution(Solver* solver, size_t index, uint8_t* result);
    void solver_cancel(Solver* solver);
    void solver_delete(Solver* solver);
}