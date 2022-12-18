#include "gecode-solver.hpp"

#include <iostream>
#include "gecode/int.hh"
#include "gecode/search.hh"

class NQueensModel : public Gecode::Space {
public:
    Gecode::IntVarArray queens;

    explicit NQueensModel(int num_queens)
        : queens(*this, num_queens, 0, num_queens-1) {
        Gecode::distinct(*this, queens);
        Gecode::distinct(*this, Gecode::IntArgs::create(num_queens,0,1), queens);
        Gecode::distinct(*this, Gecode::IntArgs::create(num_queens,0,-1), queens);
        Gecode::branch(*this, queens, Gecode::INT_VAR_SIZE_MIN(), Gecode::INT_VAL_MIN());
    }

    NQueensModel(NQueensModel& m) : Gecode::Space(m) {
        queens.update(*this, m.queens);
    }

    Gecode::Space* copy() final {
        return new NQueensModel(*this);
    }

    std::vector<uint8_t> compress() {
        std::vector<uint8_t> compressed{};
        compressed.reserve(queens.size());
        for (auto v : queens) {
            compressed.push_back(v.val());
        }
        return compressed;
    }
};

size_t GecodeSolver::solve(int32_t queens) {
    solutions.clear();
    cancel = false;
    
    Gecode::Search::Options opts;
    opts.threads = 4;
    opts.clone = false;
    auto model = new NQueensModel(queens);
    
    Gecode::DFS<NQueensModel> search(model);
    while (!cancel) {
        auto solution = search.next();
        if (!solution) {
            break;
        }
        std::lock_guard<std::mutex> guard(mutex);
        solutions.push_back(solution->compress());
        delete solution;
    }
    
    std::lock_guard<std::mutex> guard(mutex);
    return solutions.size();
}

GecodeSolver::~GecodeSolver() {}