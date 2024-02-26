
cc_binary(
    name = "hello",
    srcs = ["hello.cpp"],
)

cc_library(
    name = "greet",
    srcs = ["greet.cpp"],
    hdrs = ["greet.h"],
)

cc_binary(
    name = "greet-main",
    srcs = ["greet-main.cpp"],
    deps = [
        ":greet",
    ],
)

cc_binary(
    name = "hello-main",
    srcs = ["hello-main.cpp"],
    deps = [
        "//src/lib:hello",
    ],
)
