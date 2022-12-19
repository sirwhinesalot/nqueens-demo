cmake_minimum_required(VERSION 3.21)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED On)
set(CMAKE_CXX_EXTENSIONS Off)

project(backend)

add_subdirectory(gecode-solver/gecode)

add_library(
    backend STATIC
    src/backend.cpp
    gecode-solver/gecode-solver.cpp
)

target_include_directories(backend PUBLIC include gecode-solver)
target_link_libraries(
    backend 
    PRIVATE
    gecodeminimodel
    gecodedriver
    gecodefloat
    gecodeset 
    gecodeint 
    gecodesearch
    gecodekernel
    gecodesupport
)

install(TARGETS backend DESTINATION .)