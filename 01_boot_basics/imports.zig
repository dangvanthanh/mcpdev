const std = @import("std");
const builtin = @import("builtin");
const root = @import("root");

pub const app_name = "Boot Basic Tour";

pub fn main() !void {
    var stdout_buffer: [256]u8 = undefined;
    var stdout_writer = std.fs.File.stdout().writer(&stdout_buffer);
    const stdout = &stdout_writer.interface;

    try stdout.print("app: {s}\n", .{root.app_name});

    try stdout.print("optimize mode: {s}\n", .{@tagName(builtin.mode)});

    try stdout.print("target: {s}-{s}-{s}\n", .{ @tagName(builtin.target.cpu.arch), @tagName(builtin.target.os.tag), @tagName(builtin.target.abi) });

    try stdout.flush();
}
