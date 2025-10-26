import React, { useState } from "react";

export const DropdownMenu = ({ children }) => <div>{children}</div>;

export const DropdownMenuTrigger = ({ children, asChild }) =>
    asChild ? children : <button>{children}</button>;

export const DropdownMenuContent = ({ children, align }) => (
    <div style={{ border: "1px solid #ccc", padding: "10px" }}>{children}</div>
);

export const DropdownMenuItem = ({ children, onClick }) => (
    <div onClick={onClick} style={{ cursor: "pointer", padding: "5px 0" }}>
        {children}
    </div>
);
