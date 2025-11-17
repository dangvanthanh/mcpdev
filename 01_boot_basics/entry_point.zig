const std = @import("std");
const builtin = @import("builtin");

const ModeError = error{ReleaseOnly};

pub fn main() !void {
    requireDebugSafety() catch |err| {
        std.debug.print("warning: {s}\n", .{@errorName(err)});
    };

    try announceStartup();
}

fn requireDebugSafety() ModeError!void {
    if (builtin.mode == .Debug) return;

    return ModeError.ReleaseOnly;
}

fn announceStartup() !void {
    var stdout_buffer: [128]u8 = undefined;

    var stdout_writer = std.fs.File.stdout().writer(&stdout_buffer);

    const stdout = &stdout_writer.interface;

    try stdout.print("Zig entry point reporting in.\n", .{});

    try stdout.flush();
}
