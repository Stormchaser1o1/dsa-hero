/**
 * The core patterns, with the recognition cue that matters more than the
 * code. `match` lists the `pattern` strings from the problem bank that
 * roll up into this entry, so mastery is computed from real attempts.
 */
export const PATTERNS = [
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    cue: 'Sorted array, or you need a pair/triplet, or you are comparing from both ends.',
    idea: 'Walk two indices toward each other. Every step throws away a whole class of candidates, turning O(n²) into O(n).',
    tell: 'The brute force is a double loop over i < j and the array is (or can be) sorted.',
    match: ['Two pointers', 'Sort + two pointers', 'Two pointers from the back', 'Greedy skip', 'Dutch national flag', 'Reverse half'],
    template: `int l = 0, r = n - 1;
while (l < r) {
    int sum = a[l] + a[r];
    if (sum == target) return new int[]{l, r};
    if (sum < target) l++;      // need bigger
    else r--;                   // need smaller
}`,
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    cue: '"Longest / shortest / count of contiguous subarray or substring that satisfies X".',
    idea: 'Grow the right edge greedily; shrink the left edge only while the window is invalid. Each index enters and leaves once, so it is O(n).',
    tell: 'The word "contiguous" plus a constraint you can maintain incrementally.',
    match: ['Variable window', 'Fixed window', 'Sliding window', 'Monotonic deque'],
    template: `int l = 0, best = 0;
for (int r = 0; r < n; r++) {
    add(a[r]);
    while (!valid()) { remove(a[l]); l++; }
    best = Math.max(best, r - l + 1);
}`,
  },
  {
    id: 'hashing',
    name: 'Hash Map / Set',
    cue: '"Have I seen this before?" or "how many times has this appeared?"',
    idea: 'Trade O(n) memory for O(1) lookups. Usually collapses a nested loop into one pass.',
    tell: 'The brute force re-scans the array to find a partner or a duplicate.',
    match: ['Hash map complement', 'Hash set', 'Hash set walk', 'Frequency count', 'Signature key', 'Hash sets', 'Meet in the middle', 'Bijection map', 'Hash map clone', 'DFS + hash map'],
    template: `Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < n; i++) {
    int need = target - a[i];
    if (seen.containsKey(need)) return new int[]{seen.get(need), i};
    seen.put(a[i], i);
}`,
  },
  {
    id: 'prefix-sum',
    name: 'Prefix Sum',
    cue: 'Repeated range-sum queries, or "subarray summing to k".',
    idea: 'pre[i] = sum of the first i elements, so any range is one subtraction. Pair it with a hash map to count subarrays in one pass.',
    tell: 'You keep re-adding the same elements inside a nested loop.',
    match: ['Prefix sum', 'Prefix + hash map', 'Prefix modulo', '2-D prefix', 'Prefix / suffix', 'Prefix + binary search'],
    template: `Map<Long, Integer> count = new HashMap<>();
count.put(0L, 1);
long run = 0; int ans = 0;
for (int x : a) {
    run += x;
    ans += count.getOrDefault(run - k, 0);
    count.merge(run, 1, Integer::sum);
}`,
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    cue: 'Sorted input — or a monotonic yes/no question over a numeric answer.',
    idea: 'Halve the search space each step. "Search on answer" is the version most people miss: binary search the result, not the array.',
    tell: 'Constraints up to 1e9 with an O(n log n) budget, or "minimum largest / maximum smallest".',
    match: ['Classic binary search', 'Lower bound', 'Search on answer', 'Modified binary search', 'Flattened binary search', 'Lower / upper bound', 'Partition search'],
    template: `int lo = 0, hi = maxAnswer;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (feasible(mid)) hi = mid;   // mid works, try smaller
    else lo = mid + 1;
}
return lo;`,
  },
  {
    id: 'fast-slow',
    name: 'Fast & Slow Pointers',
    cue: 'Linked list cycles, middles, or "nth from the end".',
    idea: 'Two pointers at different speeds. The gap between them encodes the answer.',
    tell: 'You wanted to know the length first, then do a second pass.',
    match: ['Fast & slow', 'Gap two pointers', 'Pointer skip'],
    template: `ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;   // cycle
}`,
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    cue: '"Next greater / previous smaller", or rectangles under a histogram.',
    idea: 'Keep the stack sorted. When the incoming element breaks the order, everything you pop has just found its answer.',
    tell: 'The brute force scans forward from each index looking for the first bigger element.',
    match: ['Monotonic stack', 'Stack matching', 'Stack', 'Stack simulation', 'Sort + stack', 'Auxiliary stack', 'Stack parsing'],
    template: `Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && a[st.peek()] < a[i]) {
        int j = st.pop();
        ans[j] = i - j;
    }
    st.push(i);
}`,
  },
  {
    id: 'bfs',
    name: 'BFS / Level Order',
    cue: 'Shortest path on an unweighted graph or grid, or anything "level by level".',
    idea: 'A queue explores in rings of increasing distance, so the first time you reach a node is via a shortest path.',
    tell: 'The word "minimum steps" with uniform cost.',
    match: ['BFS', 'Multi-source BFS', 'BFS / DFS', 'BFS on implicit graph'],
    template: `Deque<int[]> q = new ArrayDeque<>();
q.add(new int[]{sr, sc});
seen[sr][sc] = true;
int steps = 0;
while (!q.isEmpty()) {
    for (int s = q.size(); s > 0; s--) {
        int[] cur = q.poll();
        for (int[] d : DIRS) { /* push unseen neighbours */ }
    }
    steps++;
}`,
  },
  {
    id: 'dfs',
    name: 'DFS / Recursion on Structures',
    cue: 'Trees, connected components, "explore everything reachable".',
    idea: 'Solve for the children, then combine. Most tree problems are one post-order function.',
    tell: 'The answer at a node is a function of the answers at its children.',
    match: ['DFS', 'Grid DFS', 'Border DFS', 'Reverse DFS', 'Post-order', 'Mirror DFS', 'Bounds DFS', 'Inorder', 'DFS / explicit stack', 'DFS encoding', 'Divide & conquer', 'BST walk', 'BST surgery', 'DFS + memo'],
    template: `int dfs(TreeNode node) {
    if (node == null) return 0;
    int l = dfs(node.left), r = dfs(node.right);
    best = Math.max(best, l + r);      // combine
    return 1 + Math.max(l, r);         // report upward
}`,
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    cue: '"All subsets / permutations / combinations", or a board to fill.',
    idea: 'Choose, recurse, un-choose. The un-choose is what people forget.',
    tell: 'The output is a list of every valid arrangement, not a single number.',
    match: ['Backtracking', 'Dedupe backtracking', 'Constrained backtracking', 'Grid backtracking', 'Backtracking + pruning', 'Trie + backtracking'],
    template: `void bt(int start, List<Integer> path) {
    res.add(new ArrayList<>(path));
    for (int i = start; i < n; i++) {
        path.add(a[i]);          // choose
        bt(i + 1, path);         // explore
        path.remove(path.size() - 1);  // un-choose
    }
}`,
  },
  {
    id: 'heap',
    name: 'Heap / Priority Queue',
    cue: '"Top k", "kth largest", "median of a stream", or repeatedly taking the best item.',
    idea: 'A size-k heap gives you the k best in O(n log k) without sorting everything.',
    tell: 'You were about to sort the whole array just to read a few elements off one end.',
    match: ['Heap', 'Max heap', 'Min heap of size k', 'Heap / quickselect', 'Two heaps', 'Heap sweep', 'Greedy + heap', 'Heap with tie-break', 'Bucket sort', 'Heap + hash map', 'Two heaps + greedy', 'Heap + BFS', 'Heap / divide & conquer'],
    template: `PriorityQueue<Integer> pq = new PriorityQueue<>();   // min-heap
for (int x : a) {
    pq.offer(x);
    if (pq.size() > k) pq.poll();    // drop the smallest
}
return pq.peek();                    // kth largest`,
  },
  {
    id: 'greedy',
    name: 'Greedy',
    cue: 'Intervals, scheduling, or "can I always take the locally best option?"',
    idea: 'Sort by the right key, then make one irrevocable choice per step. The hard part is proving the key is right.',
    tell: 'Sorting by start or end time makes the problem look obvious.',
    match: ['Greedy', 'Sort + greedy', 'Greedy scan', 'Greedy reach', 'Greedy layers', 'Sort + sweep', 'Intervals', 'Greedy intervals', 'Greedy last-index', 'Greedy mapping', 'Greedy + counting', 'Boyer-Moore vote', 'Custom comparator', 'Minimum spanning tree'],
    template: `Arrays.sort(iv, (x, y) -> x[1] - y[1]);   // by end time
int end = Integer.MIN_VALUE, kept = 0;
for (int[] cur : iv) {
    if (cur[0] >= end) { kept++; end = cur[1]; }
}`,
  },
  {
    id: 'dp',
    name: 'Dynamic Programming',
    cue: 'Overlapping subproblems and an optimal substructure — "count the ways", "min cost to".',
    idea: 'Write the recursion first, add a memo, and only then convert to a table if you need the space win.',
    tell: 'Plain recursion recomputes the same arguments, and the answer for n depends on n-1 / n-2.',
    match: ['1-D DP', '2-D DP', 'Grid DP', 'Interval DP', 'LIS', '0/1 knapsack', 'Unbounded knapsack', 'Kadane', 'Kadane variant', '1-D DP on a circle', '1-D DP / stack', 'Bits + DP', 'Recursion + memo', 'Expand from centre'],
    template: `int[] dp = new int[amount + 1];
Arrays.fill(dp, INF);
dp[0] = 0;
for (int c : coins)
    for (int v = c; v <= amount; v++)
        dp[v] = Math.min(dp[v], dp[v - c] + 1);`,
  },
  {
    id: 'union-find',
    name: 'Union-Find',
    cue: 'Connectivity questions, cycle detection in an undirected graph, merging groups.',
    idea: 'Near-constant-time merge and "same group?" queries with path compression and union by rank.',
    tell: 'You would otherwise re-run DFS after every edge you add.',
    match: ['Union-find', 'Cycle detection', 'Topological sort', 'Dijkstra'],
    template: `int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }
boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;      // already connected
    p[ra] = rb;
    return true;
}`,
  },
  {
    id: 'bits',
    name: 'Bit Manipulation',
    cue: '"Appears once", constant extra space, or powers of two.',
    idea: 'XOR cancels pairs; x & (x-1) clears the lowest set bit; x & -x isolates it.',
    tell: 'The constraint says O(1) space and every value appears twice except one.',
    match: ['XOR', 'XOR / Gauss sum', 'Bit manipulation', 'Recursion / bits', 'Fast exponentiation'],
    template: `int x = 0;
for (int v : a) x ^= v;    // pairs cancel, the single value survives
return x;`,
  },
  {
    id: 'trie',
    name: 'Trie',
    cue: 'Many prefix queries over a dictionary of words.',
    idea: 'A tree keyed by character. Lookup is O(word length), independent of dictionary size.',
    tell: 'You are calling startsWith in a loop over every word.',
    match: ['Trie', 'Trie + DFS', 'String matching'],
    template: `class Node { Node[] next = new Node[26]; boolean end; }
void insert(String w) {
    Node cur = root;
    for (char c : w.toCharArray()) {
        int i = c - 'a';
        if (cur.next[i] == null) cur.next[i] = new Node();
        cur = cur.next[i];
    }
    cur.end = true;
}`,
  },
];

export const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map((p) => [p.id, p]));

/** Reverse index: raw bank pattern string → core pattern id. */
export const PATTERN_LOOKUP = (() => {
  const map = {};
  for (const p of PATTERNS) for (const m of p.match) map[m] = p.id;
  return map;
})();

export function corePatternFor(rawPattern) {
  return PATTERN_LOOKUP[rawPattern] ?? null;
}
