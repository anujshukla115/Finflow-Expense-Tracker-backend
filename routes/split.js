// UPDATED: Settle Split Expense - marks ALL members as paid
async function settleSplitExpense(id) {
    const expense = splitExpenses.find(e => e._id === id);
    if (!expense) {
        showNotification('Split expense not found', 'error');
        return;
    }

    // Check if already settled
    const allPaid = expense.members.every(m => m.isPaid);
    if (allPaid) {
        showNotification('All members are already paid!', 'info');
        return;
    }

    // Confirm with user
    const confirmSettle = confirm(`Are you sure you want to mark ALL members as paid for "${expense.title}"?`);
    if (!confirmSettle) return;

    try {
        showNotification('Settling expense...', 'info');
        
        // Use the new /settle endpoint
        const data = await apiRequest(`/split/${id}/settle`, {
            method: 'PATCH'
        });

        if (data.success) {
            const index = splitExpenses.findIndex(e => e._id === id);
            if (index !== -1) {
                splitExpenses[index] = data.splitExpense;
            }
            showNotification('✅ All members settled successfully!', 'success');
            updateSplitExpensesDisplay();
        }
    } catch (error) {
        console.error('Error settling expense:', error);
        showNotification(error.message || 'Failed to settle expense. Please try again.', 'error');
    }
}

// UPDATED: Unsettle Split Expense - marks ALL members as unpaid
async function unsettleSplitExpense(id) {
    const expense = splitExpenses.find(e => e._id === id);
    if (!expense) {
        showNotification('Split expense not found', 'error');
        return;
    }

    // Check if already unsettled
    const allUnpaid = expense.members.every(m => !m.isPaid);
    if (allUnpaid) {
        showNotification('All members are already unpaid!', 'info');
        return;
    }

    // Confirm with user
    const confirmUnsettle = confirm(`Are you sure you want to mark ALL members as unpaid for "${expense.title}"?`);
    if (!confirmUnsettle) return;

    try {
        showNotification('Unsettling expense...', 'info');
        
        // Use the new /unsettle endpoint
        const data = await apiRequest(`/split/${id}/unsettle`, {
            method: 'PATCH'
        });

        if (data.success) {
            const index = splitExpenses.findIndex(e => e._id === id);
            if (index !== -1) {
                splitExpenses[index] = data.splitExpense;
            }
            showNotification('All members marked as unpaid', 'success');
            updateSplitExpensesDisplay();
        }
    } catch (error) {
        console.error('Error unsettling expense:', error);
        showNotification(error.message || 'Failed to unsettle expense', 'error');
    }
}

// UPDATED: Mark individual member as paid/unpaid (toggle)
async function markSplitMemberPaid(expenseId, memberIndex) {
    try {
        // The backend toggles the status, so if it's unpaid, it becomes paid
        const data = await apiRequest(`/split/${expenseId}/member/${memberIndex}/pay`, {
            method: 'PATCH'
        });

        if (data.success) {
            const index = splitExpenses.findIndex(e => e._id === expenseId);
            if (index !== -1) {
                splitExpenses[index] = data.splitExpense;
            }
            const member = data.splitExpense.members[memberIndex];
            showNotification(`Member marked as ${member.isPaid ? 'paid' : 'unpaid'}!`, 'success');
            updateSplitExpensesDisplay();
        }
    } catch (error) {
        console.error('Error marking member:', error);
        showNotification(error.message || 'Failed to update member status', 'error');
    }
}
