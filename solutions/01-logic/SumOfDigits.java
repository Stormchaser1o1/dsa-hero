/*
 * Topic 1 · Programming & Logic Building — Problem 3 of 8
 * Sum of the digits of a number   |   easy   |   Pattern: Digit extraction
 *
 * No online judge. Write the method, run this file, read the PASS/FAIL.
 *
 * TASK
 *   Given an int n, return the sum of its digits.
 *
 *     1234  ->  1 + 2 + 3 + 4  =  10
 *     7     ->  7
 *     0     ->  0
 *
 *   For a negative n, sum the digits of its absolute value: -1234 -> 10.
 *
 *   Do it with arithmetic. No String, no toCharArray, no split. Converting to
 *   text is a way to avoid learning the thing this problem teaches.
 *
 * BEFORE YOU WRITE CODE, ANSWER THESE OUT LOUD:
 *   1. Using only % and /, how do you read the LAST digit of n?
 *   2. Having read it, how do you throw it away and shrink n?
 *   3. What stops the loop?
 *   4. Count iterations for n = 9, then 99, then 999999, then 1000000.
 *      Line them up. Each extra digit costs exactly one more turn, and it
 *      takes multiplying n by 10 to buy that one extra turn.
 *   5. So n grew from 9 to 1000000, over a hundred thousand times bigger,
 *      while the work went from 1 turn to 7. What governs the running time,
 *      the SIZE of n or the number of DIGITS in n? Write the digit count as
 *      a formula in n and read the time complexity off it. It is not O(n):
 *      if it were, n = 1000000 would take a million turns instead of 7.
 *      This is the first logarithmic algorithm in the course, so get it
 *      from your own trace rather than from memory.
 *   6. Space complexity?
 *
 * WORTH THINKING ABOUT (not tested)
 *   Integer.MIN_VALUE is -2147483648, and there is no +2147483648 in an int.
 *   So Math.abs(Integer.MIN_VALUE) is still negative. What would your code do?
 *   How would you fix it without reaching for long?
 *
 * RULES
 *   - Think for 25 minutes before asking for hint 1.
 *   - Not done until you can state time AND space complexity.
 *
 * RUN:  java SumOfDigits.java
 */
public class SumOfDigits {

    /** Sum of the decimal digits of n; negatives are treated as |n|. */
    static int sumOfDigits(int n) {
        int sum = 0;
        int q = Math.abs(n);
        while(q>0){
            int p = q%10;
            sum +=p;
            q=q/10;
        }
        return sum;
    }

    // ---------------------------------------------------------------
    // Test harness — do not edit. Run and read the PASS/FAIL column.
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        check(1234, 10, "the worked example");
        check(7, 7, "single digit");
        check(0, 0, "zero - the loop must not run at all");
        check(10, 1, "a zero inside the number still costs an iteration");
        check(999999, 54, "six digits, the largest they can each be");
        check(1000000, 1, "one more digit than above, so one more iteration");
        check(-1234, 10, "negative, summed as |n|");
        check(-7, 7, "negative single digit");
        check(2147483647, 46, "Integer.MAX_VALUE");

        System.out.println("\n-- end --");
    }

    private static void check(int n, int expected, String why) {
        int actual = sumOfDigits(n);
        boolean pass = actual == expected;
        System.out.printf("%s  n = %-12d expected %-3d got %-3d   %s%n",
                pass ? "PASS" : "FAIL", n, expected, actual, why);
    }
}
