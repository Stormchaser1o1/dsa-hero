/*
 * Topic 1 · Programming & Logic Building — Problem 4 of 8
 * Reverse a number   |   easy   |   Pattern: Digit extraction
 *
 * No online judge here, but this is LeetCode 7 "Reverse Integer" in all but
 * name, and it is a real interview question. Treat it as one.
 *
 * TASK
 *   Given an int n, return n with its digits reversed.
 *
 *     1234   ->  4321
 *     -123   ->  -321        sign is preserved
 *     1200   ->  21          leading zeros do not survive
 *     0      ->  0
 *
 *   If the reversed value does not fit in an int, return 0.
 *
 *   Arithmetic only. No String, no StringBuilder.reverse().
 *
 * BEFORE YOU WRITE CODE, ANSWER THESE OUT LOUD:
 *   1. Last time you SUMMED the digits. Now you must REBUILD a number from
 *      them. If you have built 43 so far and the next digit is 2, what single
 *      expression gives you 432? That expression is the whole problem.
 *
 *   2. Last time you reached for Math.abs to handle negatives. Before you do
 *      it again: what does -123 % 10 actually evaluate to in Java? Do not
 *      guess — write a two-line main and print it. The answer decides whether
 *      you need Math.abs at all, and it is the tidy way around the
 *      Integer.MIN_VALUE trap you met at the end of the last problem.
 *
 *   3. 1200 must come out as 21, not 0021 or 2100. Does your loop need a
 *      special case for the trailing zeros, or does the arithmetic already
 *      handle it? Trace it before deciding.
 *
 *   4. THE HAZARD. Integer.MAX_VALUE is 2147483647. Reverse it digit by digit
 *      and you get 7463847412, which does not fit in an int. What does Java
 *      do when an int calculation exceeds the maximum? It does not crash and
 *      it does not warn. Find out what it does instead, because your loop
 *      will do exactly that silently.
 *
 *      You may accumulate into a long and check the range at the end. That is
 *      a legitimate answer and the one to write first.
 *
 *   5. BONUS, once it passes: do it without long. You get one digit of
 *      warning before the overflow happens — what must you compare against
 *      BEFORE multiplying by 10? This is the version interviewers want.
 *
 *   6. Time and space complexity. Compare them to the last problem and say
 *      whether anything actually changed.
 *
 * RULES
 *   - Think for 25 minutes before asking for hint 1.
 *   - Not done until you can state time AND space complexity.
 *
 * RUN:  java ReverseNumber.java
 */
public class ReverseNumber {

    /** n with its digits reversed, or 0 if the result will not fit in an int. */
    static int reverse(int n) {
        int  t = 0;
        while(n!=0){
            int mod = n%10;
            if(t>Integer.MAX_VALUE/10 || t<Integer.MIN_VALUE/10){
                return 0;
            }
            t = (t*10)+mod;
            n=n/10;
        }
        return t;
    }

    // ---------------------------------------------------------------
    // Test harness — do not edit. Run and read the PASS/FAIL column.
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        check(1234, 4321, "the worked example");
        check(7, 7, "single digit");
        check(0, 0, "zero");
        check(1200, 21, "trailing zeros vanish, 0021 is just 21");
        check(1000000, 1, "six trailing zeros, all of them gone");
        check(-123, -321, "negative keeps its sign");
        check(-1200, -21, "negative with trailing zeros");
        check(1463847412, 2147483641, "reverses to just under MAX_VALUE, so it fits");
        check(2147483647, 0, "MAX_VALUE reversed is 7463847412 - overflow, return 0");
        check(-2147483648, 0, "MIN_VALUE - overflows, and Math.abs cannot even negate it");

        System.out.println("\n-- end --");
    }

    private static void check(int n, int expected, String why) {
        int actual = reverse(n);
        boolean pass = actual == expected;
        System.out.printf("%s  n = %-12d expected %-11d got %-11d   %s%n",
                pass ? "PASS" : "FAIL", n, expected, actual, why);
    }
}
