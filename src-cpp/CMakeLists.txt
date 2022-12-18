cmake_minimum_required(VERSION 3.21)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED On)
set(CMAKE_CXX_EXTENSIONS Off)

project(backend)

add_subdirectory(gecode-solver)

add_library(
    backend STATIC
    src/backend.cpp
)
target_include_directories(backend PUBLIC include)
target_link_libraries(backend PRIVATE gecode-solver)

install(TARGETS backend DESTINATION .)