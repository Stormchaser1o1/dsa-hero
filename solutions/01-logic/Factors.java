/*
 * Topic 1 · Programming & Logic Building — Problem 6 of 8
 * Print all factors of a number   |   easy   |   Pattern: Loop bounds
 *
 * TASK
 *   Return every factor of n, in ascending order.
 *   A factor is an integer that divides n with no remainder.
 *
 *     36 -> 1, 2, 3, 4, 6, 9, 12, 18, 36
 *     7  -> 1, 7            (a prime has exactly two)
 *     1  -> 1
 *
 *   Assume n >= 1. Return an empty list for anything smaller.
 *
 * BEFORE YOU WRITE CODE, ANSWER THESE OUT LOUD:
 *   1. BRUTE FORCE FIRST. Test every number from 1 to n and keep the ones
 *      that divide evenly. Say its complexity out loud. Write it if you like
 *      — it will pass the first seven cases and die on the last three.
 *
 *   2. THE PAIRING. Factors come in pairs: 36 = 2 x 18, so finding 2 hands
 *      you 18 for free. List the pairs of 36 on paper:
 *
 *          1 x 36    2 x 18    3 x 12    4 x 9    6 x 6
 *
 *      Look at the LEFT column. Where does it stop, and why can it not go
 *      further? You proved this bound in the last problem — it is the same
 *      argument, used to build output rather than to answer yes or no.
 *
 *   3. THE DOUBLE-COUNT. Look at the 6 x 6 pair above. If you blindly add
 *      both halves of every pair, what happens to 36? To 49? To 16? Every
 *      perfect square in the test table is there to catch this.
 *
 *   4. THE ORDER. Walking i upward from 1 gives you the left column in
 *      ascending order, but the partners n/i arrive in DESCENDING order.
 *      The result must come out ascending. How do you reconcile that without
 *      sorting at the end? Sorting works, but there is a cheaper way, and
 *      naming it is the point of the question.
 *
 *   5. The loop bound again. i <= n / i keeps everything in ints. Convince
 *      yourself it says the same thing as i <= sqrt(n), then use whichever
 *      you can defend.
 *
 *   6. Complexity of the brute force AND of your version — time and space.
 *      Careful with space here: unlike every problem so far, this one has to
 *      RETURN a collection. Does that change the answer, and why?
 *
 * RULES
 *   - Think for 25 minutes before asking for hint 1.
 *   - Not done until you can state time AND space complexity.
 *
 * RUN:  java Factors.java
 */
import java.util.ArrayList;
import java.util.List;

public class Factors {

    /** Every factor of n, ascending. Empty when n < 1. */
    static List<Integer> factors(int n) {
        // YOUR CODE HERE
        return new ArrayList<>();
    }

    // ---------------------------------------------------------------
    // Test harness — do not edit. Watch the ms column on the last three.
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        check(36, "1,2,3,4,6,9,12,18,36", "perfect square - 6x6 must not appear twice");
        check(1, "1", "");
        check(12, "1,2,3,4,6,12", "");
        check(7, "1,7", "a prime has exactly two factors");
        check(16, "1,2,4,8,16", "perfect square again");
        check(49, "1,7,49", "square of a prime - only three factors");
        check(100, "1,2,4,5,10,20,25,50,100", "perfect square");
        check(720, "1,2,3,4,5,6,8,9,10,12,15,16,18,20,24,30,36,40,45,48,60,72,80,90,120,144,180,240,360,720", "30 factors");
        check(0, "", "n < 1 returns nothing");
        check(999999937, "1,999999937", "large prime - brute force crawls here");
        check(2147483647, "1,2147483647", "MAX_VALUE - brute force takes seconds");

        System.out.println("\n-- end --");
    }

    private static void check(int n, String expected, String why) {
        long t0 = System.nanoTime();
        List<Integer> got = factors(n);
        double ms = (System.nanoTime() - t0) / 1e6;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < got.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(got.get(i));
        }
        String actual = sb.toString();
        boolean pass = actual.equals(expected);
        System.out.printf("%s  n = %-12d %7.1f ms   %s%n", pass ? "PASS" : "FAIL", n, ms, why);
        if (!pass) {
            System.out.println("        expected: " + expected);
            System.out.println("        actual:   " + actual);
        }
    }
}
