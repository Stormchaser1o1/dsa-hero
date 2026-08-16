/*
 * Topic 1 · Programming & Logic Building — Problem 1 of 8
 * Print a right-angled star triangle   |   easy   |   Pattern: Nested loops
 *
 * TASK
 *   Given n, print a right-angled triangle of '*' with n rows.
 *   Row i (1-indexed) contains exactly i stars.
 *
 *   n = 5  ->   *
 *              **
 *             ***
 *            ****
 *           *****
 *
 * BEFORE YOU WRITE CODE, ANSWER THESE OUT LOUD:
 *   1. How many lines does the output have?
 *   2. On row i, how many characters are printed?
 *   3. What is the TOTAL number of '*' printed, as a formula in n?
 *   4. From that formula: what is the time complexity?
 *   5. How much extra memory do you use beyond the output?
 *
 * RULES
 *   - Think for 25 minutes before asking for hint 1.
 *   - Not done until you can state time AND space complexity.
 *
 * RUN:  java StarTriangle.java
 */
public class StarTriangle {

    /** Print the triangle for the given number of rows. */
    static void printTriangle(int n) {
        // YOUR CODE HERE
    }

    // ---------------------------------------------------------------
    // Test harness — do not edit. Run and compare against expected.
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("n = 5  (expect rows of 1,2,3,4,5 stars)");
        printTriangle(5);

        System.out.println("\nn = 1  (expect a single '*')");
        printTriangle(1);

        System.out.println("\nn = 0  (expect nothing at all)");
        printTriangle(0);

        System.out.println("\n-- end --");
    }
}
