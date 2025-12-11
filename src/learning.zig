const std = @import("std");

pub fn main() !void {
    try std.fs.File.stdout().writeAll("Hello Zig");

    std.debug.print("\n", .{});

    std.debug.print("Hello, {s}!\n", .{"Zig"});
}
