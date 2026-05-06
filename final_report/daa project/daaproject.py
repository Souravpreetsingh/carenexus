import tkinter as tk
from tkinter import messagebox
import sys

V = 5

positions = {
    0: (100, 200),
    1: (250, 100),
    2: (400, 200),
    3: (250, 300),
    4: (550, 200)
}

sample_graph = [
    [0, 10, 0, 30, 100],
    [10, 0, 50, 0, 0],
    [0, 50, 0, 20, 10],
    [30, 0, 20, 0, 60],
    [100, 0, 10, 60, 0]
]

# Dijkstra Algorithm
def dijkstra(graph, src):
    dist = [sys.maxsize] * V
    visited = [False] * V
    parent = [-1] * V

    dist[src] = 0

    for _ in range(V):
        u = -1
        min_val = sys.maxsize

        for i in range(V):
            if not visited[i] and dist[i] < min_val:
                min_val = dist[i]
                u = i

        visited[u] = True

        for v in range(V):
            if graph[u][v] and not visited[v]:
                if dist[u] + graph[u][v] < dist[v]:
                    dist[v] = dist[u] + graph[u][v]
                    parent[v] = u

    return dist, parent


def get_path(parent, j):
    path = []
    while j != -1:
        path.append(j)
        j = parent[j]
    return path[::-1]


# Draw Graph
def draw_graph(canvas, graph, highlight_path=[]):
    canvas.delete("all")

    # Draw edges
    for i in range(V):
        for j in range(i+1, V):
            if graph[i][j] != 0:
                x1, y1 = positions[i]
                x2, y2 = positions[j]

                color = "black"
                width = 2

                if i in highlight_path and j in highlight_path:
                    idx = highlight_path.index(i)
                    if idx + 1 < len(highlight_path) and highlight_path[idx+1] == j:
                        color = "red"
                        width = 4

                canvas.create_line(x1, y1, x2, y2, fill=color, width=width)
                canvas.create_text((x1+x2)//2, (y1+y2)//2, text=str(graph[i][j]))

    # Draw nodes
    for i in range(V):
        x, y = positions[i]

        fill_color = "lightblue"
        if i in highlight_path:
            fill_color = "yellow"

        canvas.create_oval(x-25, y-25, x+25, y+25, fill=fill_color)
        canvas.create_text(x, y, text=f"N{i}", font=("Arial", 12, "bold"))


# Calculate Button
def calculate():
    try:
        src = int(source_entry.get())
        dest = int(dest_entry.get())

        if src < 0 or src >= V or dest < 0 or dest >= V:
            raise ValueError

        graph = []
        for i in range(V):
            row = []
            for j in range(V):
                val = int(matrix_entries[i][j].get())
                row.append(val)
            graph.append(row)

        dist, parent = dijkstra(graph, src)
        path = get_path(parent, dest)

        draw_graph(canvas, graph, path)

        result_label.config(
            text=f"Shortest distance from {src} to {dest}: {dist[dest]}"
        )

    except:
        messagebox.showerror("Error", "Invalid input!")


# Auto-fill
def autofill():
    for i in range(V):
        for j in range(V):
            matrix_entries[i][j].delete(0, tk.END)
            matrix_entries[i][j].insert(0, sample_graph[i][j])


# GUI Setup
root = tk.Tk()
root.title("Dijkstra Visualizer")

# 🔥 BIG HEADING
title_label = tk.Label(
    root,
    text="DIJKSTRA'S SHORTEST PATH VISUALIZER",
    font=("Helvetica", 20, "bold"),
    fg="white",
    bg="black",
    padx=10,
    pady=10
)
title_label.pack(fill="x")

tk.Label(root, text="Enter Graph (5x5 Matrix):").pack()

frame = tk.Frame(root)
frame.pack()

matrix_entries = []

# Grid input
for i in range(V):
    row_entries = []
    for j in range(V):
        e = tk.Entry(frame, width=5, justify='center')
        e.grid(row=i, column=j, padx=2, pady=2)
        row_entries.append(e)
    matrix_entries.append(row_entries)

tk.Button(root, text="Auto Fill Sample Graph", command=autofill).pack(pady=5)

tk.Label(root, text="Source Node (0-4):").pack()
source_entry = tk.Entry(root)
source_entry.pack()

tk.Label(root, text="Destination Node (0-4):").pack()
dest_entry = tk.Entry(root)
dest_entry.pack()

tk.Button(root, text="Find Shortest Path", command=calculate).pack(pady=5)

canvas = tk.Canvas(root, width=700, height=400, bg="white")
canvas.pack()

result_label = tk.Label(root, text="")
result_label.pack()

# Initial graph
draw_graph(canvas, sample_graph)

root.mainloop()