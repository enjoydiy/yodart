cmake_minimum_required(VERSION 3.0)
project(yodaosclient-c)

aux_source_directory(src SRC_LIST)
include_directories("./include")

set(HEADER_FILES
    ./include/yodaos_sdk.h
    ./include/yodaos_api_defines.h
    ./include/yodaos_apis.h
)
link_libraries(rlog flora-cli caps pthread json-c rklog)

if(EXISTS "$ENV{STAGING_DIR}")
    include_directories("$ENV{STAGING_DIR}/usr/include/caps/")
endif()

add_definitions(-DYODAOS_EXPORT -DUSING_RKLOG -Wall -Wno-unused-parameter)

add_library(yodaclient_c SHARED ${SRC_LIST})
add_executable(yodaclient_c_example ${SRC_LIST} example/example.c)

install(FILES ${HEADER_FILES}
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/usr/include
    PERMISSIONS OWNER_READ OWNER_WRITE GROUP_READ WORLD_READ
)

install(TARGETS yodaclient_c
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include
)

install(TARGETS yodaclient_c_example
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include
)
