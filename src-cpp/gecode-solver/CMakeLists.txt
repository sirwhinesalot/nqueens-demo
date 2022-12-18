add_subdirectory(gecode)

add_library(
    gecode-solver STATIC 
    gecode-solver.cpp
)
target_include_directories(gecode-solver PUBLIC . ${PROJECT_SOURCE_DIR}/include)
target_link_libraries(
    gecode-solver
    PUBLIC
    gecodesupport 
    gecodekernel 
    gecodesearch 
    gecodeint 
    gecodeset 
    gecodefloat 
    gecodeminimodel 
    gecodedriver
)

install(TARGETS gecode-solver DESTINATION .)