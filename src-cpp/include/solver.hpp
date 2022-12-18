#pragma once

#include <string>
#include <mutex>
#include <vector>

class Solver {
public:
    std::mutex mutex;
    std::vector<std::vector<uint8_t>> solutions;
    bool cancel = false;
    virtual size_t solve(int32_t queens) = 0;
    virtual ~Solver() {};
};
