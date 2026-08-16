/*
 * Topic 1 · Programming & Logic Building — Problem 2 of 8
 * FizzBuzz   |   easy   |   Pattern: Conditionals in a loop
 *
 * JUDGE: https://leetcode.com/problems/fizz-buzz/
 *   This is the one problem in Topic 1 with an online judge. Think and iterate
 *   here, then paste fizzBuzz into LeetCode for the real verdict. There the
 *   method lives inside `class Solution` and is NOT static, so drop the
 *   `static` keyword when you paste.
 *
 * TASK
 *   Return a list of n strings, answer[i] for i from 1 to n, where:
 *     - "FizzBuzz"  if i is divisible by both 3 and 5
 *     - "Fizz"      if i is divisible by 3
 *     - "Buzz"      if i is divisible by 5
 *     - the number itself, as a string, otherwise
 *
 *   n = 15  ->  1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz,
 *               11, Fizz, 13, 14, FizzBuzz
 *
 * BEFORE YOU WRITE CODE, ANSWER THESE OUT LOUD:
 *   1. How many strings does the returned list hold?
 *   2. Which condition must you test FIRST? Write the three tests in the wrong
 *      order on paper and trace i = 15 through them. What comes out, and why?
 *   3. The list is 0-indexed but the rules are stated for i from 1 to n.
 *      Which one does your loop counter follow, and where does the mismatch
 *      have to be absorbed?
 *   4. What is the time complexity?
 *   5. What is the space complexity? Careful — this one is NOT O(1), and the
 *      reason it differs from the star triangle is the whole lesson here.
 *
 * RULES
 *   - Think for 25 minutes before asking for hint 1.
 *   - Not done until you can state time AND space complexity.
 *
 * RUN:  java FizzBuzz.java
 */
import java.util.AbstractList;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.IntFunction;

public class FizzBuzz {

    /*
     * SOLUTION 1 — materialised. Accepted on LeetCode.
     *
     * Build every string up front and store it. The else-if chain is what makes
     * it correct: i % 15 is tested first, so 15 is claimed by "FizzBuzz" before
     * the i % 3 branch can grab it. Reorder those two and every FizzBuzz in the
     * output silently becomes a Fizz — the output still looks plausible, which
     * is exactly why the bug survives a quick glance.
     *
     * i % 15 works as the combined test because 3 and 5 are coprime, so
     * "divisible by 3 and by 5" and "divisible by 15" are the same condition.
     *
     * Time  O(n) — one pass, constant work per number.
     * Space O(n) — n strings are alive at once. Unlike the star triangle, the
     *              output IS the return value, so it counts.
     */
    static List<String> fizzBuzz(int n) {
        List<String> list = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) {
                list.add("FizzBuzz");
            } else if (i % 3 == 0) {
                list.add("Fizz");
            } else if (i % 5 == 0) {
                list.add("Buzz");
            } else {
                list.add(Integer.toString(i));   // clearer than i + ""
            }
        }
        return list;
    }

    /*
     * SOLUTION 2 — lazy view, line by line.
     *
     * Same answers, but nothing is stored. Read it as: "a List is anything that
     * can answer how big am I and what is at index k". If you can answer those
     * two questions by computing, you never have to remember.
     *
     *   return new AbstractList<String>() { ... };
     *      AbstractList is a half-built List. It already implements iterator(),
     *      contains(), indexOf(), equals(), hashCode(), stream() and the rest —
     *      all written in terms of get() and size(). Supply those two and you
     *      inherit a working read-only List. The `new ...() { }` is an anonymous
     *      class: a subclass defined and instantiated in one expression.
     *
     *   public String get(int index)
     *      Called on demand, once per element per read. Nothing runs at
     *      construction time.
     *
     *   int i = index + 1;
     *      The list is 0-indexed; FizzBuzz is defined over 1..n. This single
     *      line is where that mismatch is absorbed — the same off-by-one the
     *      loop in Solution 1 handles by starting at i = 1.
     *
     *   if (i % 15 == 0) return "FizzBuzz";
     *      Early returns replace the else-if chain. Order still matters for the
     *      identical reason: the first matching return wins.
     *
     *   public int size() { return n; }
     *      n is captured from the enclosing method. Java only allows this
     *      because n is effectively final — never reassigned after the
     *      parameter is bound. Try adding n++ anywhere above and this stops
     *      compiling.
     *
     *   Objects.checkIndex(index, n)
     *      Not in the version found online, and its absence is a real bug: a
     *      List must throw IndexOutOfBoundsException for out-of-range access,
     *      and without this get(-1) cheerfully returns "Fizz". Iteration hides
     *      it, because the inherited iterator stops at size().
     *
     * Time  O(1) to create, O(n) to walk it — the work moved, it did not vanish.
     * Space O(1) held: no backing array, and each string becomes collectable
     *              the moment the caller is done with it. Total allocation over
     *              a full pass is still O(n).
     *
     * The honest trade-off: values are recomputed on every access, so reading
     * the list twice does the work twice. It wins when the caller reads a small
     * slice of a huge range, and loses when the caller reads everything more
     * than once — which is what a judge comparing output actually does.
     */
    static List<String> fizzBuzzLazy(int n) {
        return new AbstractList<String>() {
            @Override
            public String get(int index) {
                Objects.checkIndex(index, n);
                int i = index + 1;
                if (i % 15 == 0) return "FizzBuzz";
                if (i % 3 == 0) return "Fizz";
                if (i % 5 == 0) return "Buzz";
                return Integer.toString(i);
            }

            @Override
            public int size() {
                return n;
            }
        };
    }

    // ---------------------------------------------------------------
    // Test harness — do not edit. Both solutions must pass identically.
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        run("Solution 1 - materialised", FizzBuzz::fizzBuzz);
        run("Solution 2 - lazy view", FizzBuzz::fizzBuzzLazy);

        System.out.println("\n-- end --");
    }

    private static void run(String label, IntFunction<List<String>> impl) {
        System.out.println("== " + label + " ==");
        check(impl, 15, "1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz");
        check(impl, 5, "1, 2, Fizz, 4, Buzz");
        check(impl, 3, "1, 2, Fizz");
        check(impl, 1, "1");
        check(impl, 0, "");
        checkOutOfBounds(impl, 5);
        System.out.println();
    }

    private static void check(IntFunction<List<String>> impl, int n, String expected) {
        String actual = String.join(", ", impl.apply(n));
        boolean pass = actual.equals(expected);
        System.out.println((pass ? "PASS" : "FAIL") + "  n = " + n);
        if (!pass) {
            System.out.println("      expected: " + expected);
            System.out.println("      actual:   " + actual);
        }
    }

    /** A List must reject an index outside 0..size-1 rather than answer it. */
    private static void checkOutOfBounds(IntFunction<List<String>> impl, int n) {
        List<String> list = impl.apply(n);
        boolean threw = false;
        try {
            list.get(n);
        } catch (IndexOutOfBoundsException e) {
            threw = true;
        }
        System.out.println((threw ? "PASS" : "FAIL") + "  get(" + n + ") on size " + n + " throws");
    }
}
