#pragma once

#include "solver.hpp"

class GecodeSolver : public Solver {
public:
    size_t solve(int32_t queens) final;
    ~GecodeSolver() final;
};