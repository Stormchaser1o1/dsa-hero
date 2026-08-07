export const COMPLEXITY_TABLE = [
  { op: 'Array access by index', time: 'O(1)', note: 'Contiguous memory' },
  { op: 'Array search (unsorted)', time: 'O(n)', note: 'Must look at everything' },
  { op: 'Binary search (sorted)', time: 'O(log n)', note: 'Halves each step' },
  { op: 'HashMap get / put', time: 'O(1) avg', note: 'O(n) worst on collisions' },
  { op: 'Sorting (Arrays.sort)', time: 'O(n log n)', note: 'Dual-pivot quicksort / TimSort' },
  { op: 'Heap push / pop', time: 'O(log n)', note: 'Sift up or down the tree' },
  { op: 'Heap peek', time: 'O(1)', note: 'Root of the heap' },
  { op: 'Linked list insert at head', time: 'O(1)', note: 'No shifting' },
  { op: 'Linked list search', time: 'O(n)', note: 'No random access' },
  { op: 'Balanced BST search / insert', time: 'O(log n)', note: 'TreeMap in Java' },
  { op: 'BFS / DFS on a graph', time: 'O(V + E)', note: 'Each node and edge once' },
  { op: 'Dijkstra with a heap', time: 'O(E log V)', note: 'Non-negative weights' },
  { op: 'Union-Find (compressed)', time: 'O(α(n))', note: 'Effectively constant' },
  { op: 'Trie insert / search', time: 'O(L)', note: 'L = word length' },
];

export const CONSTRAINT_HINTS = [
  { n: 'n ≤ 10', budget: 'O(n!) or O(2ⁿ)', means: 'Permutations or full backtracking are fine.' },
  { n: 'n ≤ 20', budget: 'O(2ⁿ)', means: 'Subset enumeration, bitmask DP.' },
  { n: 'n ≤ 500', budget: 'O(n³)', means: 'Triple loop, interval DP.' },
  { n: 'n ≤ 5,000', budget: 'O(n²)', means: 'Double loop, 2-D DP.' },
  { n: 'n ≤ 10⁶', budget: 'O(n log n)', means: 'Sort, heap, binary search.' },
  { n: 'n ≤ 10⁸', budget: 'O(n)', means: 'One pass. Hash map or two pointers.' },
  { n: 'n > 10⁹', budget: 'O(log n) or O(1)', means: 'Math, or binary search on the answer.' },
];

export const LINKS = [
  { group: 'Practice', items: [
    { name: 'LeetCode', url: 'https://leetcode.com/problemset/', note: 'Where every linked problem lives' },
    { name: 'NeetCode 150', url: 'https://neetcode.io/practice', note: 'Pattern-grouped list, close to this curriculum' },
    { name: 'LeetCode Contests', url: 'https://leetcode.com/contest/', note: 'Weekly, for timed pressure' },
  ]},
  { group: 'Visualise', items: [
    { name: 'VisuAlgo', url: 'https://visualgo.net/en', note: 'Animated data structures' },
    { name: 'Python Tutor (Java mode)', url: 'https://pythontutor.com/java.html', note: 'Step through your code line by line' },
    { name: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/', note: 'Complexity reference table' },
  ]},
  { group: 'Java', items: [
    { name: 'Java Collections overview', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html', note: 'Official API docs' },
    { name: 'ArrayDeque as a stack/queue', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html', note: 'Faster than Stack and LinkedList' },
    { name: 'PriorityQueue', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html', note: 'Min-heap by default' },
  ]},
  { group: 'Interview', items: [
    { name: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/', note: 'Behavioural + technical prep' },
    { name: 'Pramp — free mock interviews', url: 'https://www.pramp.com/', note: 'Practice thinking out loud' },
  ]},
];

export const JAVA_SNIPPETS = [
  { name: 'Fast input', code: `BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
int n = Integer.parseInt(br.readLine().trim());` },
  { name: 'Sort with a comparator', code: `Arrays.sort(iv, (a, b) -> Integer.compare(a[1], b[1]));
list.sort(Comparator.comparingInt(x -> -x));   // descending` },
  { name: 'Max-heap', code: `PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());` },
  { name: 'Frequency map', code: `Map<Character, Integer> f = new HashMap<>();
for (char c : s.toCharArray()) f.merge(c, 1, Integer::sum);` },
  { name: 'Grid directions', code: `static final int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};` },
  { name: 'Build a string', code: `StringBuilder sb = new StringBuilder();
sb.append(c);
return sb.reverse().toString();` },
];
